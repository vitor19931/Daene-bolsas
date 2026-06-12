/**
 * daEnê — Carrinho / Sacola de Compras
 */

const Cart = (() => {
  const WA_NUMBER = '557192135975';
  let items = [];

  function _loadFromStorage() {
    try {
      const stored = localStorage.getItem('daene_cart');
      items = stored ? JSON.parse(stored) : [];

      items = items.filter(item => {
        if (!item.id || typeof item.qty !== 'number' || item.qty < 1) {
          return false;
        }
        return true;
      });

      const uniqueMap = new Map();
      items.forEach(item => {
        if (uniqueMap.has(item.id)) {
          uniqueMap.get(item.id).qty += item.qty;
        } else {
          uniqueMap.set(item.id, { ...item });
        }
      });
      items = Array.from(uniqueMap.values());

      if (stored && stored !== JSON.stringify(items)) {
        _save();
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      items = [];
    }
  }

  function _save() {
    try {
      localStorage.setItem('daene_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  function add(id, clickedBtn = null) {
    if (typeof DB === 'undefined') return;
    const product = DB.getProduct(id);
    if (!product || product.stock === 'esgotado') return;

    const existing = items.find(i => i.id === id);
    existing ? existing.qty++ : items.push({ id, qty: 1 });

    _save();
    updateCount();
    render();
    openDrawer();

    const btn = document.getElementById('cartBtn');
    if (btn) {
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 400);
    }

    /* ── Feedback Dinâmico no Botão clicado ─ */
    if (clickedBtn) {
      const originalText = clickedBtn.textContent;
      clickedBtn.textContent = '✓ Adicionado';
      clickedBtn.style.backgroundColor = 'var(--green)';
      clickedBtn.style.borderColor = 'var(--green)';
      clickedBtn.disabled = true;
      setTimeout(() => {
        clickedBtn.textContent = originalText;
        clickedBtn.style.backgroundColor = '';
        clickedBtn.style.borderColor = '';
        clickedBtn.disabled = false;
      }, 1500);
    }
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    _save(); updateCount(); render();
  }

  function changeQty(id, delta) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { remove(id); return; }
    _save(); updateCount(); render();
  }

  function updateCount() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const total = items.reduce((s, i) => s + i.qty, 0);
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  }

  function openDrawer() {
    render();
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function render() {
    const container = document.getElementById('cartItems');
    const totalEl   = document.getElementById('cartTotal');
    const footerEl  = document.getElementById('cartFooter');
    if (!container || typeof DB === 'undefined') return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <span>👜</span>
          <strong>Sua sacola está vazia.</strong>
          <small style="color: var(--muted2)">Adicione peças para encomendá-las pelo WhatsApp.</small>
        </div>`;
      if (totalEl) totalEl.textContent = DB.formatPrice(0);
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    let total = 0;
    container.innerHTML = items.map(item => {
      const p = DB.getProduct(item.id);
      if (!p) return '';
      total += p.price * item.qty;
      const visual = p.img
        ? `<img src="${p.img}" alt="${p.name}">`
        : `<span>${p.emoji || '👜'}</span>`;
      return `
        <div class="cart-item">
          <div class="cart-item-icon">${visual}</div>
          <div class="cart-item-info">
            <strong>${p.name}</strong>
            <span>${DB.formatPrice(p.price)}</span>
            <button class="remove-btn" onclick="Cart.remove('${item.id}')">Remover</button>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', 1)">+</button>
          </div>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = DB.formatPrice(total);
    if (footerEl) footerEl.style.display = 'flex';
  }

  function checkout() {
    if (items.length === 0) { openDrawer(); return; }
    if (typeof DB === 'undefined') return;

    let texto = 'Olá, daEnê! 🌸 Gostaria de encomendar as seguintes peças:\n\n';
    let total  = 0;
    const orderItems = [];

    items.forEach(item => {
      const p = DB.getProduct(item.id);
      if (!p) return;
      const sub = p.price * item.qty;
      total += sub;
      texto += `• *${item.qty}x ${p.name}* — ${DB.formatPrice(sub)}\n`;
      orderItems.push({ id: p.id, name: p.name, price: p.price, qty: item.qty });
    });

    texto += `\n*Total estimado: ${DB.formatPrice(total)}*\n\n`;
    texto += 'Aguardo o retorno para combinarmos os tecidos, cores e entrega! ✨';

    if (typeof DB.saveOrder === 'function') {
      DB.saveOrder({ items: orderItems, total });
    }

    items = [];
    _save(); updateCount(); render(); closeDrawer();

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank');
  }

  _loadFromStorage();

  return {
    WA_NUMBER,
    add,
    remove,
    changeQty,
    updateCount,
    openDrawer,
    closeDrawer,
    render,
    checkout
  };
})();

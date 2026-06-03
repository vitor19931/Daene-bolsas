/**
 * daEnê — Gerenciamento do Carrinho
 */

const Cart = (() => {
  const KEY = 'daene_cart';
  const WA_NUMBER = '5500000000000'; // ← Substitua aqui pelo seu número real com DDD (Apenas números)

  function getItems() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    updateCount();
  }

  function add(productId, qty = 1) {
    const items = getItems();
    const existing = items.find(i => i.id === productId);
    const product = DB.getProduct(productId);
    if (!product) return;

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: productId, qty });
    }
    save(items);
    showCartFeedback();
  }

  function remove(productId) {
    save(getItems().filter(i => i.id !== productId));
  }

  function updateQty(productId, qty) {
    const items = getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      save(items);
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
    render();
    updateCount();
  }

  function getTotal() {
    return getItems().reduce((sum, item) => {
      const p = DB.getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function updateCount() {
    const total = getItems().reduce((sum, i) => sum + i.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  function render() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');
    if (!container) return;

    const items = getItems();
    if (items.length === 0) {
      container.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
      if (footer) footer.style.display = 'none';
      return;
    }

    container.innerHTML = items.map(item => {
      const p = DB.getProduct(item.id);
      if (!p) return '';
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-icon">${p.emoji || '👜'}</div>
          <div class="cart-item-info">
            <strong>${p.name}</strong>
            <span>${DB.formatPrice(p.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.updateQty('${p.id}', ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${p.id}', ${item.qty + 1})">+</button>
          </div>
          <button class="remove-btn" onclick="Cart.remove('${p.id}')" title="Remover">✕</button>
        </div>
      `;
    }).join('');

    if (footer) {
      footer.style.display = 'flex';
      totalEl.textContent = DB.formatPrice(getTotal());
    }
  }

  function checkout() {
    const items = getItems();
    if (items.length === 0) return;

    const lines = items.map(item => {
      const p = DB.getProduct(item.id);
      return `• ${item.qty}x ${p.name} — ${DB.formatPrice(p.price * item.qty)}`;
    });
    lines.push('');
    lines.push(`*Total: ${DB.formatPrice(getTotal())}*`);

    const msg = encodeURIComponent(
      `Olá! Gostaria de encomendar os seguintes itens da daEnê:\n\n${lines.join('\n')}`
    );

    DB.saveOrder({ items: getItems(), total: getTotal() });
    clear();
    closeDrawer();
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
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

  function showCartFeedback() {
    const btn = document.getElementById('cartBtn');
    if (!btn) return;
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 600);
  }

  // REPARO: Expõe o WA_NUMBER para o script.js usar dinamicamente
  return { WA_NUMBER, add, remove, updateQty, clear, getTotal, render, updateCount, checkout, openDrawer, closeDrawer };
})();
/**
 * daEnê — Controle do Carrinho (Sacola de Compras)
 */

const Cart = (() => {
  const WA_NUMBER = '557192135975';
  let items = JSON.parse(localStorage.getItem('daene_cart')) || [];

  function save() {
    localStorage.setItem('daene_cart', JSON.stringify(items));
  }

  function add(id) {
    if (typeof DB === 'undefined') return;
    const product = DB.getProduct(id);
    if (!product || product.stock === 'esgotado') return;

    const existing = items.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ id, qty: 1 });
    }

    save();
    updateCount();
    render();
    openDrawer();

    const btn = document.getElementById('cartBtn');
    if (btn) {
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 400);
    }
  }

  function remove(id) {
    items = items.filter(item => item.id !== id);
    save();
    updateCount();
    render();
  }

  function changeQty(id, delta) {
    const item = items.find(item => item.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      remove(id);
      return;
    }

    save();
    updateCount();
    render();
  }

  function updateCount() {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalQty;
  }

  function openDrawer() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    render();
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function render() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!container || typeof DB === 'undefined') return;

    if (items.length === 0) {
      container.innerHTML = '<p class="no-products" style="padding:2rem 0; text-align:center;">Sua sacola está vazia.</p>';
      if (totalEl) totalEl.textContent = DB.formatPrice(0);
      return;
    }

    let totalGeral = 0;

    container.innerHTML = items.map(item => {
      const p = DB.getProduct(item.id);
      if (!p) return '';

      const itemTotal = p.price * item.qty;
      totalGeral += itemTotal;

      const visual = p.img 
        ? `<img src="${p.img}" alt="${p.name}">` 
        : p.emoji || '👜';

      return `
        <div class="cart-item">
          <div class="cart-item-icon">${visual}</div>
          <div class="cart-item-info">
            <strong>${p.name}</strong>
            <span>${DB.formatPrice(p.price)}</span>
            <span class="remove-btn" onclick="Cart.remove('${item.id}')">Remover</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = DB.formatPrice(totalGeral);
  }

  function checkout() {
    if (items.length === 0 || typeof DB === 'undefined') {
      alert('Sua sacola está vazia!');
      return;
    }

    let texto = 'Olá, daEnê! Gostaria de encomendar as seguintes peças:\n\n';
    let totalGeral = 0;

    items.forEach(item => {
      const p = DB.getProduct(item.id);
      if (!p) return;
      const sub = p.price * item.qty;
      totalGeral += sub;
      texto += `• *${item.qty}x ${p.name}* (${DB.formatPrice(p.price)} cada)\n`;
    });

    texto += `\n*Total estimado:* ${DB.formatPrice(totalGeral)}\n\n`;
    texto += 'Aguardo o seu retorno para combinarmos os tecidos e a entrega! ✨';

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

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

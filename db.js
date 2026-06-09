/**
 * daEnê — Módulo do Carrinho (Cart)
 * Gerencia a sacola de compras e a conexão com a API do WhatsApp.
 */

const Cart = (() => {
  const WA_NUMBER = '557192135975'; 
  const STORAGE_KEY = 'daene_cart_items_v3';

  function getItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCount();
    if (document.getElementById('cartDrawer')?.classList.contains('open')) {
      renderDrawer();
    }
  }

  function add(productId) {
    if (typeof DB === 'undefined') return;
    const product = DB.getProduct(productId);
    if (!product || product.stock === 'esgotado') return;

    const items = getItems();
    const existing = items.find(item => item.id === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji || '👜',
        img: product.img || '',
        quantity: 1
      });
    }

    saveItems(items);
    
    const btn = document.getElementById('cartBtn');
    if (btn) {
      btn.classList.remove('pulse');
      void btn.offsetWidth; 
      btn.classList.add('pulse');
    }
  }

  function changeQty(productId, delta) {
    let items = getItems();
    const item = items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      items = items.filter(i => i.id !== productId);
    }
    saveItems(items);
  }

  function remove(productId) {
    const items = getItems().filter(i => i.id !== productId);
    saveItems(items);
  }

  function updateCount() {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;
    const total = getItems().reduce((acc, curr) => acc + curr.quantity, 0);
    countEl.textContent = total;
  }

  function openDrawer() {
    renderDrawer();
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!container || !totalEl || typeof DB === 'undefined') return;

    const items = getItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <span>👜</span>
          <p>Sua sacola está vazia</p>
          <small>Adicione peças lindas do catálogo!</small>
        </div>
      `;
      totalEl.textContent = DB.formatPrice(0);
      return;
    }

    container.innerHTML = items.map(item => {
      const iconContent = item.img 
        ? `<img src="${item.img}" alt="${item.name}">` 
        : item.emoji;

      return `
        <div class="cart-item">
          <div class="cart-item-icon">${iconContent}</div>
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <span>${DB.formatPrice(item.price)}</span>
            <span class="remove-btn" onclick="Cart.remove('${item.id}')">Remover</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    const totalCost = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    totalEl.textContent = DB.formatPrice(totalCost);
  }

  function checkout() {
    const items = getItems();
    if (items.length === 0 || typeof DB === 'undefined') return;

    let msg = `✨ *Novo Pedido — daEnê Costura Criativa* ✨\n\n`;
    msg += `Olá, gostaria de encomendar as seguintes peças:\n`;
    msg += `─────────────────────────\n`;

    items.forEach(item => {
      msg += `• *${item.quantity}x* ${item.name} — ${DB.formatPrice(item.price * item.quantity)}\n`;
    });

    const totalCost = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    msg += `─────────────────────────\n`;
    msg += `*Total Estimado:* ${DB.formatPrice(totalCost)}\n\n`;
    msg += `Por favor, verifique a disponibilidade das peças para mim. Obrigado! ❤️`;

    localStorage.removeItem(STORAGE_KEY);
    updateCount();
    closeDrawer();

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return { WA_NUMBER, add, changeQty, remove, updateCount, openDrawer, closeDrawer, checkout };
})();

/**
 * daEnê — Script Principal
 */

// ─── Configuração Compartilhada do WhatsApp ──────────────────────────────────
const WHATSAPP_NUMBER = typeof Cart !== 'undefined' && Cart.WA_NUMBER ? Cart.WA_NUMBER : '5571988378939'; 

// ─── Ano no rodapé ───────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Inicialização do carrinho ───────────────────────────────────────────────
if (typeof Cart !== 'undefined') {
  Cart.updateCount();
}

// ─── Navegação / Menu Mobile ─────────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle?.addEventListener('click', () => {
  mainNav?.classList.toggle('open');
  menuToggle.classList.toggle('active');
});

mainNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.classList.remove('active');
  });
});

// ─── Efeito Active Nav Link Correto no Scroll ──────────────────────
const navLinks = document.querySelectorAll('.main-nav a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

// ─── Animação Reveal on Scroll Limpa ───────────────────────────────
const revObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { 
    if (e.isIntersecting) { 
      e.target.classList.add('visible'); 
      obs.unobserve(e.target); 
    } 
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ─── Eventos do Carrinho ─────────────────────────────────────────────────────
document.getElementById('cartBtn')?.addEventListener('click', () => Cart?.openDrawer());
document.getElementById('cartOverlay')?.addEventListener('click', () => Cart?.closeDrawer());
document.getElementById('closeCart')?.addEventListener('click', () => Cart?.closeDrawer());
document.getElementById('checkoutBtn')?.addEventListener('click', () => Cart?.checkout());

// ─── Renderizar Produtos ──────────────────────────────────────────────────────
let currentCat = 'todas';

function renderProducts(cat = 'todas') {
  currentCat = cat;
  const grid = document.getElementById('productGrid');
  if (!grid || typeof DB === 'undefined') return;

  const products = DB.getByCategory(cat);
  if (products.length === 0) {
    grid.innerHTML = '<p class="no-products">Nenhuma peça encontrada nessa categoria.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const stockBadge = {
      disponivel: '<span class="badge green">Disponível</span>',
      encomenda: '<span class="badge yellow">Sob Encomenda</span>',
      esgotado: '<span class="badge red">Esgotado</span>',
    }[p.stock] || '';

    const imgContent = p.img
      ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
      : `<div class="product-emoji">${p.emoji || '👜'}</div>`;

    const featuredTag = p.featured ? '<span class="featured-tag">⭐ Destaque</span>' : '';

    return `
      <article class="product-card ${p.stock === 'esgotado' ? 'out-of-stock' : ''}" data-id="${p.id}">
        <div class="product-img" onclick="openModal('${p.id}')">
          ${imgContent}
          ${featuredTag}
          ${stockBadge}
        </div>
        <div class="product-info">
          <h3 onclick="openModal('${p.id}')">${p.name}</h3>
          <p>${p.short}</p>
          <div class="product-footer">
            <strong class="product-price">${DB.formatPrice(p.price)}</strong>
            ${p.stock !== 'esgotado'
              ? `<button class="btn-add" onclick="Cart.add('${p.id}')">+ Adicionar</button>`
              : `<span class="sold-out">Esgotado</span>`
            }
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
document.getElementById('filters')?.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

// Inicialização primária
renderProducts();

// ─── Modal de Produto ─────────────────────────────────────────────────────────
function openModal(id) {
  if (typeof DB === 'undefined') return;
  const p = DB.getProduct(id);
  if (!p) return;

  const imgContent = p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%; border-radius:16px; margin-bottom:1.5rem; aspect-ratio:1; object-fit:cover;">`
    : `<div class="modal-emoji">${p.emoji || '👜'}</div>`;

  const stockText = { 
    disponivel: 'Disponível em estoque', 
    encomenda: 'Disponível sob encomenda (prazo a combinar)', 
    esgotado: 'Temporariamente esgotado' 
  }[p.stock];

  const modalBody = document.getElementById('modalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    ${imgContent}
    <div class="modal-cat">${p.category}</div>
    <h2>${p.name}</h2>
    <p class="modal-desc">${p.description || p.short}</p>
    <div class="modal-meta">
      <span class="modal-stock">${stockText}</span>
    </div>
    <div class="modal-price">${DB.formatPrice(p.price)}</div>
    <div class="modal-actions">
      ${p.stock !== 'esgotado'
        ? `<button class="btn-primary" onclick="Cart.add('${p.id}'); closeModal()">🛒 Adicionar ao Carrinho</button>`
        : ''
      }
      <a class="btn-outline" href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá!+Tenho+interesse+na+peça:+${encodeURIComponent(p.name)}" target="_blank">💬 Perguntar no WhatsApp</a>
    </div>
  `;

  document.getElementById('productModal')?.classList.add('open');
  document.getElementById('modalOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal')?.classList.remove('open');
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('closeModal')?.addEventListener('click', closeModal);
document.getElementById('modalOverlay')?.addEventListener('click', closeModal);

// ─── MUDANÇA AQUI: Formulário de Contato integrado ao WhatsApp ────────────────
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();

  // 1. Captura as mensagens reais digitadas pelo usuário nas caixinhas do site
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const msg = document.getElementById('cMsg').value.trim();

  // 2. Agrupa tudo em um texto organizado com quebras de linha
  const waText = `*Novo Contato - daEnê*\n\n*Nome:* ${name}\n*E-mail:* ${email}\n*Telefone:* ${phone}\n*Mensagem:* ${msg}`;
  const encodedText = encodeURIComponent(waText);

  // 3. Redireciona o usuário para o seu número com o texto exato que ele digitou
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');

  // 4. Mostra o alerta verde de sucesso na tela e limpa os campos do formulário
  const successEl = document.getElementById('formSuccess');
  if (successEl) {
    successEl.style.display = 'block';
    setTimeout(() => successEl.style.display = 'none', 4000);
  }
  e.target.reset();
});

// ─── Painel Admin ─────────────────────────────────────────────────────────────
function openAdmin() {
  renderAdminList();
  document.getElementById('adminPanel')?.classList.add('open');
  document.getElementById('adminOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdmin() {
  document.getElementById('adminPanel')?.classList.remove('open');
  document.getElementById('adminOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('adminTrigger')?.addEventListener('click', openAdmin);
document.getElementById('closeAdmin')?.addEventListener('click', closeAdmin);
document.getElementById('adminOverlay')?.addEventListener('click', closeAdmin);

function renderAdminList() {
  const container = document.getElementById('adminProductList');
  if (!container || typeof DB === 'undefined') return;
  
  const products = DB.getProducts();

  container.innerHTML = products.map(p => {
    const visualContent = p.img 
      ? `<img src="${p.img}" class="admin-item-thumb" alt="${p.name}">`
      : `<span class="admin-item-emoji">${p.emoji || '👜'}</span>`;

    return `
      <div class="admin-item">
        ${visualContent}
        <div class="admin-item-info">
          <strong>${p.name}</strong>
          <span>${DB.formatPrice(p.price)} — ${p.category} — ${p.stock}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-sm outline" onclick="loadProductEdit('${p.id}')">Editar</button>
          <button class="btn-sm danger" onclick="deleteProductAdmin('${p.id}')">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

function loadProductEdit(id) {
  if (typeof DB === 'undefined') return;
  const p = DB.getProduct(id);
  if (!p) return;
  
  document.getElementById('editId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pCat').value = p.category;
  document.getElementById('pEmoji').value = p.emoji || '';
  document.getElementById('pImg').value = p.img || '';
  document.getElementById('pShort').value = p.short;
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pFeatured').value = p.featured ? '1' : '0';
  document.getElementById('adminForm')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteProductAdmin(id) {
  if (typeof DB === 'undefined' || !confirm('Deseja excluir este produto?')) return;
  DB.deleteProduct(id);
  renderAdminList();
  renderProducts(currentCat);
}

document.getElementById('clearForm')?.addEventListener('click', () => {
  document.getElementById('adminForm')?.reset();
  const editId = document.getElementById('editId');
  if (editId) editId.value = '';
});

document.getElementById('adminForm')?.addEventListener('submit', e => {
  e.preventDefault();
  if (typeof DB === 'undefined') return;

  const id = document.getElementById('editId').value;
  const product = {
    ...(id ? { id } : {}),
    name: document.getElementById('pName').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    category: document.getElementById('pCat').value,
    emoji: document.getElementById('pEmoji').value.trim() || '👜',
    img: document.getElementById('pImg').value.trim(),
    short: document.getElementById('pShort').value.trim(),
    description: document.getElementById('pDesc').value.trim(),
    stock: document.getElementById('pStock').value,
    featured: document.getElementById('pFeatured').value === '1',
  };

  DB.saveProduct(product);
  document.getElementById('adminForm').reset();
  document.getElementById('editId').value = '';
  renderAdminList();
  renderProducts(currentCat);
});

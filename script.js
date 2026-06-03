/**
 * daEnê — Script Principal Conectado ao WhatsApp e Protegido por Senha
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
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%; border-radius:16px; margin-bottom:

/**
 * daEnê — Script de Interatividade e Controle Principal
 */

const WHATSAPP_NUMBER = typeof Cart !== 'undefined' && Cart.WA_NUMBER ? Cart.WA_NUMBER : '557192135975'; 
let loadedImageBase64 = ""; 
let currentImageObject = null; // Guarda o objeto da imagem carregada para edição ao vivo

// Atualização de data do copyright
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

if (typeof Cart !== 'undefined') {
  Cart.updateCount();
}

// Menu Mobile Transicional
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

// Sincronização de Menu de Rolagem (Scroll Spy)
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

// Animações Fluídas de Reveal no Scroll
const revObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { 
    if (e.isIntersecting) { 
      e.target.classList.add('visible'); 
      obs.unobserve(e.target); 
    } 
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// Ouvintes do Carrinho Gaveta
document.getElementById('cartBtn')?.addEventListener('click', () => Cart?.openDrawer());
document.getElementById('cartOverlay')?.addEventListener('click', () => Cart?.closeDrawer());
document.getElementById('closeCart')?.addEventListener('click', () => Cart?.closeDrawer());
document.getElementById('checkoutBtn')?.addEventListener('click', () => Cart?.checkout());

// Renderizador da Vitrine com Filtragem Dinâmica
let currentCat = 'todas';

function renderProducts(cat = 'todas') {
  currentCat = cat;
  const grid = document.getElementById('productGrid');
  if (!grid || typeof DB === 'undefined') return;

  const products = DB.getByCategory(cat);
  if (products.length === 0) {
    grid.innerHTML = '<p class="no-products">Nenhuma peça cadastrada nesta categoria no momento.</p>';
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

// Filtros
document.getElementById('filters')?.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

renderProducts();

// Modal Detalhes da Peça
function openModal(id) {
  if (typeof DB === 'undefined') return;
  const p = DB.getProduct(id);
  if (!p) return;

  const imgContent = p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%; border-radius:16px; margin-bottom:1.5rem; aspect-ratio:1; object-fit:cover;">`
    : `<div class="modal-emoji">${p.emoji || '👜'}</div>`;

  const stockText = { 
    disponivel: 'Disponível em estoque no ateliê', 
    encomenda: 'Disponível sob encomenda', 
    esgotado: 'Temporariamente indisponível' 
  }[p.stock];

  const modalBody = document.getElementById('modalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    ${imgContent}
    <div class="modal-cat">${p.category}</div>
    <h2>${p.name}</h2>
    <p class="modal-desc">${p.description || p.short}</p>
    <div class="modal-meta">
      <span class="modal-stock">● ${stockText}</span>
    </div>
    <div class="modal-price">${DB.formatPrice(p.price)}</div>
    <div class="modal-actions">
      ${p.stock !== 'esgotado'
        ? `<button class="btn-primary" onclick="Cart.add('${p.id}'); closeModal()">🛒 Adicionar ao Carrinho</button>`
        : ''
      }
      <a class="btn-outline" href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá!+Gostaria+de+saber+mais+sobre+a+peça:+${encodeURIComponent(p.name)}" target="_blank">💬 Perguntar no WhatsApp</a>
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

// Painel Admin Protegido por Chave de Acesso
function openAdmin() {
  const SENHA_CORRETA = "Daene1234"; 
  const senhaDigitada = prompt("Digite a credencial de segurança administrativa:");
  
  if (senhaDigitada !== SENHA_CORRETA) {
    alert("Chave de segurança incorreta ou acesso negado.");
    return; 
  }

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

// Mecanismo Avançado de Ajuste da Imagem (Zoom e Movimento por Canvas)
document.getElementById('pImgFile')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    currentImageObject = new Image();
    currentImageObject.src = event.target.result;
    currentImageObject.onload = function() {
      // Reseta os valores dos controles deslizantes
      document.getElementById('sliderZoom').value = 1;
      document.getElementById('sliderX').value = 0;
      document.getElementById('sliderY').value = 0;
      
      // Define limites dinâmicos para mover com base no tamanho da imagem carregada
      const maxRange = Math.max(currentImageObject.width, currentImageObject.height);
      document.getElementById('sliderX').min = -maxRange;
      document.getElementById('sliderX').max = maxRange;
      document.getElementById('sliderY').min = -maxRange;
      document.getElementById('sliderY').max = maxRange;

      updateCropCanvas();
    }
  };
  reader.readAsDataURL(file);
});

// Atualiza a renderização do corte em tempo real conforme mexe nos sliders
function updateCropCanvas() {
  if (!currentImageObject) return;

  const canvas = document.getElementById('cropCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const zoom = parseFloat(document.getElementById('sliderZoom').value);
  const panX = parseFloat(document.getElementById('sliderX').value);
  const panY = parseFloat(document.getElementById('sliderY').value);

  // Limpa o canvas de visualização
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Encontra a escala ideal para cobrir o quadrado de 400x400
  const baseScale = Math.max(canvas.width / currentImageObject.width, canvas.height / currentImageObject.height);
  const finalScale = baseScale * zoom;

  const widthRenderizada = currentImageObject.width * finalScale;
  const heightRenderizada = currentImageObject.height * finalScale;

  // Centraliza e aplica o deslocamento manual (panX e panY)
  const posX = (canvas.width - widthRenderizada) / 2 + panX;
  const posY = (canvas.height - heightRenderizada) / 2 + panY;

  ctx.drawImage(currentImageObject, posX, posY, widthRenderizada, heightRenderizada);

  // Salva no estado base64 otimizado (Qualidade de 65% para garantir espaço no localStorage)
  loadedImageBase64 = canvas.toDataURL('image/jpeg', 0.65);

  const box = document.getElementById('adminPreviewBox');
  if (box) box.style.display = 'flex';
}

// Vincula o evento de arrastar nos sliders para atualizar a foto instantaneamente
['sliderZoom', 'sliderX', 'sliderY'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateCropCanvas);
});

document.getElementById('removePreviewBtn')?.addEventListener('click', () => {
  currentImageObject = null;
  loadedImageBase64 = "";
  const fileInput = document.getElementById('pImgFile');
  if(fileInput) fileInput.value = "";
  const box = document.getElementById('adminPreviewBox');
  if(box) box.style.display = 'none';
});

// CRUD do Admin
function renderAdminList() {
  const container = document.getElementById('adminProductList');
  if (!container || typeof DB === 'undefined') return;
  
  const products = DB.getProducts();

  container.innerHTML = products.map(p => {
    const visualContent = p.img 
      ? `<img src="${p.img}">`
      : p.emoji || '👜';

    return `
      <div class="admin-item">
        <div class="admin-item-thumb">${visualContent}</div>
        <div class="admin-item-info">
          <strong>${p.name}</strong>
          <span>${DB.formatPrice(p.price)} — ${p.category}</span>
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
  document.getElementById('pShort').value = p.short;
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pFeatured').value = p.featured ? '1' : '0';
  
  if (p.img) {
    currentImageObject = new Image();
    currentImageObject.src = p.img;
    currentImageObject.onload = function() {
      document.getElementById('sliderZoom').value = 1;
      document.getElementById('sliderX').value = 0;
      document.getElementById('sliderY').value = 0;
      updateCropCanvas();
    }
  } else {
    currentImageObject = null;
    loadedImageBase64 = "";
    const box = document.getElementById('adminPreviewBox');
    if(box) box.style.display = 'none';
  }
  
  document.getElementById('adminForm')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteProductAdmin(id) {
  if (typeof DB === 'undefined' || !confirm('Deseja definitivamente remover este item do catálogo?')) return;
  DB.deleteProduct(id);
  renderAdminList();
  renderProducts(currentCat);
}

document.getElementById('clearForm')?.addEventListener('click', () => {
  document.getElementById('adminForm')?.reset();
  document.getElementById('editId').value = '';
  currentImageObject = null;
  loadedImageBase64 = "";
  const box = document.getElementById('adminPreviewBox');
  if(box) box.style.display = 'none';
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
    img: loadedImageBase64, 
    short: document.getElementById('pShort').value.trim(),
    description: document.getElementById('pDesc').value.trim(),
    stock: document.getElementById('pStock').value,
    featured: document.getElementById('pFeatured').value === '1',
  };

  DB.saveProduct(product);
  document.getElementById('adminForm').reset();
  document.getElementById('editId').value = '';
  currentImageObject = null;
  loadedImageBase64 = "";
  const box = document.getElementById('adminPreviewBox');
  if(box) box.style.display = 'none';
  
  renderAdminList();
  renderProducts(currentCat);
});

document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const successEl = document.getElementById('formSuccess');
  if (successEl) {
    successEl.style.display = 'block';
    setTimeout(() => successEl.style.display = 'none', 4000);
  }
  e.target.reset();
});

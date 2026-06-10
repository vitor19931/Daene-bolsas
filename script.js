/**
 * daEnê — Script Principal
 */

const WHATSAPP_NUMBER = (typeof Cart !== 'undefined' && Cart.WA_NUMBER) ? Cart.WA_NUMBER : '557192135975';

/* ── Utilitários ────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── Ano no rodapé ──────────────────────────────────────────────────────── */
const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Inicializa contagem do carrinho ────────────────────────────────────── */
if (typeof Cart !== 'undefined') Cart.updateCount();

/* ── Menu Mobile ────────────────────────────────────────────────────────── */
const menuToggle = $('menuToggle');
const mainNav    = $('mainNav');

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

/* ── Active nav link no scroll ──────────────────────────────────────────── */
const navLinks  = document.querySelectorAll('.main-nav a');
const secObs    = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

/* ── Reveal on scroll ───────────────────────────────────────────────────── */
const revObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── Eventos do Carrinho ────────────────────────────────────────────────── */
$('cartBtn')     ?.addEventListener('click', () => Cart?.openDrawer());
$('cartOverlay') ?.addEventListener('click', () => Cart?.closeDrawer());
$('closeCart')   ?.addEventListener('click', () => Cart?.closeDrawer());
$('checkoutBtn') ?.addEventListener('click', () => Cart?.checkout());

/* ═══════════════════════════════════════════════════════════════════════════
   VITRINE DE PRODUTOS
═══════════════════════════════════════════════════════════════════════════ */
let currentCat = 'todas';

function renderProducts(cat = 'todas') {
  currentCat = cat;
  const grid = $('productGrid');
  if (!grid || typeof DB === 'undefined') return;

  const products = DB.getByCategory(cat);

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🧵</span>
        <p>Nenhuma peça nesta categoria ainda.</p>
        <small style="color: var(--muted2)">Tente outra categoria ou entre em contato para encomendas personalizadas.</small>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const badge = { disponivel: '<span class="badge green">Disponível</span>', encomenda: '<span class="badge yellow">Sob Encomenda</span>', esgotado: '<span class="badge red">Esgotado</span>' }[p.stock] || '';
    const imgContent  = p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<div class="product-emoji">${p.emoji || '👜'}</div>`;
    const destaque    = p.featured ? '<span class="featured-tag">⭐ Destaque</span>' : '';

    return `
      <article class="product-card${p.stock === 'esgotado' ? ' out-of-stock' : ''}" data-id="${p.id}">
        <div class="product-img" onclick="openModal('${p.id}')">
          ${imgContent}${destaque}${badge}
        </div>
        <div class="product-info">
          <h3 onclick="openModal('${p.id}')">${p.name}</h3>
          <p>${p.short}</p>
          <div class="product-footer">
            <strong class="product-price">${DB.formatPrice(p.price)}</strong>
            ${p.stock !== 'esgotado'
              ? `<button class="btn-add" data-add-id="${p.id}" onclick="Cart.add('${p.id}', this)">+ Adicionar</button>`
              : `<span class="sold-out">Esgotado</span>`}
          </div>
        </div>
      </article>`;
  }).join('');
}

/* ── Filtros ────────────────────────────────────────────────────────────── */
$('filters')?.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

// Renderização inicial
renderProducts();

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL DE PRODUTO
═══════════════════════════════════════════════════════════════════════════ */
function openModal(id) {
  if (typeof DB === 'undefined') return;
  const p = DB.getProduct(id);
  if (!p) return;

  const imgContent = p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:16px;margin-bottom:1.5rem;aspect-ratio:1;object-fit:cover;">`
    : `<div class="modal-emoji">${p.emoji || '👜'}</div>`;

  const stockMap = { disponivel: '● Disponível em estoque', encomenda: '● Sob encomenda (prazo a combinar)', esgotado: '● Temporariamente indisponível' };

  $('modalBody').innerHTML = `
    ${imgContent}
    <div class="modal-cat">${p.category}</div>
    <h2>${p.name}</h2>
    <p class="modal-desc">${p.description || p.short}</p>
    <div class="modal-meta"><span class="modal-stock">${stockMap[p.stock] || ''}</span></div>
    <div class="modal-price">${DB.formatPrice(p.price)}</div>
    <div class="modal-actions">
      ${p.stock !== 'esgotado' ? `<button class="btn-primary" onclick="Cart.add('${p.id}');closeModal()">🛒 Adicionar ao Carrinho</button>` : ''}
      <a class="btn-outline" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre: ' + p.name)}" target="_blank">💬 Perguntar no WhatsApp</a>
    </div>`;

  $('productModal')?.classList.add('open');
  $('modalOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('productModal')?.classList.remove('open');
  $('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

$('closeModal')  ?.addEventListener('click', closeModal);
$('modalOverlay')?.addEventListener('click', closeModal);

/* ── Suporte à tecla ESC para fechar Modais e Carrinhos (Aprimoramento UX) ─ */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    if (typeof Cart !== 'undefined') Cart.closeDrawer();
    closeAdmin();
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   FORMULÁRIO DE CONTATO → WHATSAPP
═══════════════════════════════════════════════════════════════════════════ */
$('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const nome     = $('cName').value.trim();
  const email    = $('cEmail').value.trim();
  const telefone = $('cPhone').value.trim();
  const mensagem = $('cMsg').value.trim();

  const texto = `Olá, daEnê! 🌸 Vim pelo site.\n\n*Nome:* ${nome}\n*E-mail:* ${email}\n*WhatsApp:* ${telefone}\n\n*Mensagem:*\n${mensagem}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank');

  const suc = $('formSuccess');
  if (suc) { suc.style.display = 'block'; setTimeout(() => suc.style.display = 'none', 4000); }
  e.target.reset();
});

/* ═══════════════════════════════════════════════════════════════════════════
   PAINEL ADMIN
═══════════════════════════════════════════════════════════════════════════ */
function openAdmin() {
  const senha = prompt('🔐 Informe a credencial de acesso ao painel:');
  if (senha !== 'Daene1234') { alert('Chave incorreta. Acesso negado.'); return; }
  renderAdminList();
  $('adminPanel')?.classList.add('open');
  $('adminOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdmin() {
  $('adminPanel')?.classList.remove('open');
  $('adminOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

$('adminTrigger')?.addEventListener('click', openAdmin);
$('closeAdmin')  ?.addEventListener('click', closeAdmin);
$('adminOverlay')?.addEventListener('click', closeAdmin);

/* ── Lista Admin ────────────────────────────────────────────────────────── */
function renderAdminList() {
  const container = $('adminProductList');
  if (!container || typeof DB === 'undefined') return;

  const products = DB.getProducts();
  if (products.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:1rem;">Nenhuma peça cadastrada.</p>';
    return;
  }

  container.innerHTML = products.map(p => {
    const thumb = p.img
      ? `<img src="${p.img}" alt="${p.name}">`
      : `<span style="font-size:1.5rem">${p.emoji || '👜'}</span>`;

    return `
      <div class="admin-item">
        <div class="admin-item-thumb">${thumb}</div>
        <div class="admin-item-info">
          <strong>${p.name}</strong>
          <span>${DB.formatPrice(p.price)} — ${p.category} — ${p.stock}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-sm outline" onclick="loadProductEdit('${p.id}')">Editar</button>
          <button class="btn-sm danger"  onclick="deleteProductAdmin('${p.id}')">Excluir</button>
        </div>
      </div>`;
  }).join('');
}

function loadProductEdit(id) {
  if (typeof DB === 'undefined') return;
  const p = DB.getProduct(id);
  if (!p) return;

  $('editId').value    = p.id;
  $('pName').value     = p.name;
  $('pPrice').value    = p.price;
  $('pCat').value      = p.category;
  $('pEmoji').value    = p.emoji || '';
  $('pShort').value    = p.short;
  $('pDesc').value     = p.description || '';
  $('pStock').value    = p.stock;
  $('pFeatured').value = p.featured ? '1' : '0';

  cropState.isNewImage = false;

  if (p.img) {
    _loadImageIntoEditor(p.img);
  } else {
    _resetImageEditor();
  }

  $('adminForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteProductAdmin(id) {
  if (typeof DB === 'undefined') return;
  if (!confirm('Remover esta peça do catálogo?')) return;
  DB.deleteProduct(id);
}

$('clearForm')?.addEventListener('click', () => {
  $('adminForm')?.reset();
  $('editId').value = '';
  _resetImageEditor();
});

let isSubmittingForm = false;

$('adminForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  
  // 🛡️ PROTEÇÃO CONTRA SUBMISSÃO DUPLA
  if (isSubmittingForm) return;
  isSubmittingForm = true;
  
  if (typeof DB === 'undefined') {
    isSubmittingForm = false;
    return;
  }

  try {
    // VALIDAÇÕES RIGOROSAS
    const name = $('pName').value.trim();
    const price = parseFloat($('pPrice').value);
    const category = $('pCat').value;
    const short = $('pShort').value.trim();
    
    if (!name || name.length < 3) {
      alert('Nome do produto deve ter pelo menos 3 caracteres.');
      isSubmittingForm = false;
      return;
    }
    
    if (!price || price <= 0) {
      alert('Preço deve ser maior que zero.');
      isSubmittingForm = false;
      return;
    }
    
    if (!short || short.length < 5) {
      alert('Descrição curta deve ter pelo menos 5 caracteres.');
      isSubmittingForm = false;
      return;
    }

    let id = $('editId').value ? $('editId').value.trim() : '';
    const existingProduct = id ? DB.getProduct(id) : null;

    // 🛡️ TRAVA ANTIDUPLICAÇÃO: Evita criar novo produto com nome+categoria já existente
    if (!id) {
      const inputNameLower = name.toLowerCase();
      const duplicate = DB.getProducts().find(p => 
        p.name.trim().toLowerCase() === inputNameLower && 
        p.category === category
      );
      
      if (duplicate) {
        alert(`Já existe um produto com o nome "${name}" nesta categoria. Edite o existente ou mude o nome/categoria.`);
        isSubmittingForm = false;
        return;
      }
    }

    // 🖼️ TRAVA INTELIGENTE DE IMAGEM: Garante que apenas uma nova imagem seja salva
    let finalImg = '';
    
    if (cropState.isNewImage && cropState.imageObj) {
      // Uma nova imagem foi carregada - exporta ela
      finalImg = _exportCroppedImage();
    } else if (existingProduct && existingProduct.img) {
      // Editando e mantendo a imagem anterior
      finalImg = existingProduct.img;
    }
    // Se não tem imagem antiga e não carregou nova, fica vazio (mostra emoji)

    const product = {
      name:        name,
      price:       price,
      category:    category,
      emoji:       $('pEmoji').value.trim() || '👜',
      img:         finalImg,
      short:       short,
      description: $('pDesc').value.trim(),
      stock:       $('pStock').value,
      featured:    $('pFeatured').value === '1'
    };

    if (id) {
      product.id = id;
      // Preserva metadados antigos
      if (existingProduct && existingProduct.createdAt) {
        product.createdAt = existingProduct.createdAt;
      }
    } else {
      product.id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      product.createdAt = Date.now();
    }

    DB.saveProduct(product);

    // Reseta os estados de forma limpa
    $('adminForm').reset();
    $('editId').value = '';
    _resetImageEditor();
    cropState.isNewImage = false;

    // Feedback visual de sucesso
    const saveBtn = $('adminForm').querySelector('[type="submit"]');
    const orig = saveBtn.textContent;
    saveBtn.textContent = '✓ Salvo!';
    saveBtn.style.background = 'var(--green)';
    saveBtn.disabled = true;
    
    setTimeout(() => { 
      saveBtn.textContent = orig; 
      saveBtn.style.background = ''; 
      saveBtn.disabled = false;
      isSubmittingForm = false;
    }, 1500);

  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar. Verifique a imagem e tente novamente.');
    isSubmittingForm = false;
  }
});

/* ─── EDITOR DE FOTO — UPLOAD + CROP INTERATIVO ────────────────────────── */
const cropState = {
  imageObj:   null,
  zoom:       1,
  panX:       0,
  panY:       0,
  isDragging: false,
  lastX:      0,
  lastY:      0,
  isNewImage: false
};

const CANVAS_SIZE = 400; 

function _loadImageIntoEditor(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    cropState.imageObj = img;
    cropState.zoom     = 1;
    cropState.panX     = 0;
    cropState.panY     = 0;

    const maxPan = Math.max(img.width, img.height);
    const sX = $('sliderX');
    const sY = $('sliderY');
    if (sX) { sX.min = -maxPan; sX.max = maxPan; sX.value = 0; }
    if (sY) { sY.min = -maxPan; sY.max = maxPan; sY.value = 0; }
    const sZ = $('sliderZoom');
    if (sZ) sZ.value = 1;

    const box = $('adminPreviewBox');
    if (box) box.style.display = 'flex';

    _drawCrop();
  };
  img.onerror = () => console.log('Carregando imagem padrão ou emoji.');
  img.src = src;
}

function _resetImageEditor() {
  cropState.imageObj = null;
  cropState.zoom     = 1;
  cropState.panX     = 0;
  cropState.panY     = 0;
  cropState.isNewImage = false;

  const fileInput = $('pImgFile');
  if (fileInput) fileInput.value = '';

  const box = $('adminPreviewBox');
  if (box) box.style.display = 'none';

  const canvas = $('cropCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }
}

function _drawCrop() {
  const canvas = $('cropCanvas');
  if (!canvas || !cropState.imageObj) return;

  canvas.width  = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const img      = cropState.imageObj;
  const baseScale = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight);
  const scale    = baseScale * cropState.zoom;

  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (CANVAS_SIZE - w) / 2 + cropState.panX;
  const y = (CANVAS_SIZE - h) / 2 + cropState.panY;

  ctx.drawImage(img, x, y, w, h);
}

function _exportCroppedImage() {
  const canvas = $('cropCanvas');
  if (!canvas) return '';
  return canvas.toDataURL('image/jpeg', 0.80);
}

$('pImgFile')?.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Por favor, selecione um arquivo de imagem.'); return; }
  cropState.isNewImage = true;
  const reader = new FileReader();
  reader.onload = e => _loadImageIntoEditor(e.target.result);
  reader.readAsDataURL(file);
});

$('removePreviewBtn')?.addEventListener('click', _resetImageEditor);

$('sliderZoom')?.addEventListener('input', function () {
  cropState.zoom = parseFloat(this.value);
  _drawCrop();
});

$('sliderX')?.addEventListener('input', function () {
  cropState.panX = parseFloat(this.value);
  _drawCrop();
});

$('sliderY')?.addEventListener('input', function () {
  cropState.panY = parseFloat(this.value);
  _drawCrop();
});

(function attachCanvasDrag() {
  const canvas = $('cropCanvas');
  if (!canvas) return;

  canvas.addEventListener('mousedown', e => {
    if (!cropState.imageObj) return;
    cropState.isDragging = true;
    cropState.lastX = e.clientX;
    cropState.lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!cropState.isDragging) return;
    const dx = e.clientX - cropState.lastX;
    const dy = e.clientY - cropState.lastY;
    cropState.lastX = e.clientX;
    cropState.lastY = e.clientY;
    cropState.panX += dx;
    cropState.panY += dy;
    _syncSlidersFromState();
    _drawCrop();
  });

  window.addEventListener('mouseup', () => {
    cropState.isDragging = false;
    if (canvas) canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('touchstart', e => {
    if (!cropState.imageObj) return;
    e.preventDefault();
    const touch = e.touches[0];
    cropState.isDragging = true;
    cropState.lastX = touch.clientX;
    cropState.lastY = touch.clientY;
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    if (!cropState.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - cropState.lastX;
    const dy = touch.clientY - cropState.lastY;
    cropState.lastX = touch.clientX;
    cropState.lastY = touch.clientY;
    cropState.panX += dx;
    cropState.panY += dy;
    _syncSlidersFromState();
    _drawCrop();
  }, { passive: false });

  window.addEventListener('touchend', () => { cropState.isDragging = false; });

  canvas.addEventListener('wheel', e => {
    if (!cropState.imageObj) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    cropState.zoom = Math.min(4, Math.max(1, cropState.zoom + delta));
    _syncSlidersFromState();
    _drawCrop();
  }, { passive: false });
})();

function _syncSlidersFromState() {
  const sZ = $('sliderZoom');
  const sX = $('sliderX');
  const sY = $('sliderY');
  if (sZ) sZ.value = cropState.zoom;
  if (sX) sX.value = cropState.panX;
  if (sY) sY.value = cropState.panY;
}

/* ═══════════════════════════════════════════════════════════════════════════
   🌌 CONTROLE DA AURA DO CURSOR PREMIUM (DESKTOPS)
═══════════════════════════════════════════════════════════════════════════ */
(function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Aborta em telas touch/celulares

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  ring.className = 'custom-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    // Interpolação suave para o efeito elástico de "atraso fluído" da aura
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Escuta hover em elementos clicáveis de forma dinâmica
  const clickables = 'a, button, [onclick], input, select, textarea, .product-card, .filter-btn, .product-img';
  
  document.addEventListener('mouseover', e => {
    if (e.target.closest(clickables)) {
      ring.classList.add('hover');
      dot.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (!e.target.closest(clickables)) {
      ring.classList.remove('hover');
      dot.classList.remove('hover');
    }
  });
})();
/* ═══════════════════════════════════════════════════════════════════════════
   🛡️ ROTINA DE LIMPEZA AUTOMÁTICA DE DUPLICATAS - MELHORADA
═══════════════════════════════════════════════════════════════════════════ */
let isDuplicateCheckRunning = false;

(function autoCleanDuplicates() {
  if (typeof DB === 'undefined' || isDuplicateCheckRunning) return;
  isDuplicateCheckRunning = true;
  
  setTimeout(() => {
    try {
      const products = DB.getProducts();
      const seen = new Map();
      const toDelete = [];

      products.forEach(p => {
        const key = p.name.trim().toLowerCase() + '|' + p.category;
        
        if (seen.has(key)) {
          const existing = seen.get(key);
          
          // Mantém o que tem VERDADEIRA imagem (não vazia)
          if (existing.img && existing.img.length > 50 && (!p.img || p.img.length <= 50)) {
            toDelete.push(p.id);
          } else if ((!existing.img || existing.img.length <= 50) && p.img && p.img.length > 50) {
            toDelete.push(existing.id);
            seen.set(key, p);
          } else {
            // Se ambos têm imagem ou nenhum tem, mantém o mais antigo (createdAt menor)
            if (p.createdAt && existing.createdAt && p.createdAt < existing.createdAt) {
              toDelete.push(existing.id);
              seen.set(key, p);
            } else {
              toDelete.push(p.id);
            }
          }
        } else {
          seen.set(key, p);
        }
      });

      // Remove duplicatas identificadas
      if (toDelete.length > 0) {
        toDelete.forEach(id => {
          console.log(`Removendo duplicata: ${id}`);
          DB.deleteProduct(id);
        });
        
        setTimeout(() => {
          if (typeof renderProducts === 'function') renderProducts(currentCat || 'todas');
          if (typeof renderAdminList === 'function' && document.getElementById('adminPanel')?.classList.contains('open')) {
            renderAdminList();
          }
          console.log(`✓ Limpeza: ${toDelete.length} duplicata(s) removida(s).`);
        }, 500);
      }
    } catch (error) {
      console.error('Erro na limpeza de duplicatas:', error);
    } finally {
      isDuplicateCheckRunning = false;
    }
  }, 1000);
})();

// ✅ FIX FINAL DUPLICAÇÃO
function autoCleanDuplicates() {
  if (typeof DB === 'undefined') return;

  const products = DB.getProducts();
  const seen = new Map();

  products.forEach(p => {
    const key = p.name.trim().toLowerCase() + "|" + p.category;

    if (!seen.has(key)) {
      seen.set(key, p);
    }
  });

  renderProducts(currentCat);
}

// roda uma vez só
setTimeout(autoCleanDuplicates, 1200);

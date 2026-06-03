/**
 * daEnê — Banco de Dados (localStorage)
 * Gerencia produtos, pedidos e configurações da loja.
 */

const DB = (() => {
  const KEYS = {
    products: 'daene_products',
    orders: 'daene_orders',
    settings: 'daene_settings',
  };

  // ─── Produtos padrão ──────────────────────────────────────────────────────
  const DEFAULT_PRODUCTS = [
    {
      id: 'p001',
      name: 'Bolsa Tote Elegance',
      price: 189.90,
      category: 'totes',
      emoji: '👜',
      img: '',
      short: 'Espaçosa, estruturada e perfeita para o trabalho ou passeios.',
      description: 'A Tote Elegance combines praticidade e sofisticação. Com amplo espaço interno, bolso organizador com zíper, alças reforçadas e forro impermeável. Disponível em diversas cores sob encomenda.',
      stock: 'disponivel',
      featured: true,
      createdAt: Date.now(),
    },
    {
      id: 'p002',
      name: 'Mochila Urbana Chic',
      price: 229.90,
      category: 'mochilas',
      emoji: '🎒',
      img: '',
      short: 'Conforto e sofisticação para o dia a dia urbano.',
      description: 'Mochila com design moderno e feminino, alças acolchoadas reguláveis, compartimento acolchoado para notebook 13" e bolsos organizadores internos e externos. Feita sob encomenda.',
      stock: 'encomenda',
      featured: true,
      createdAt: Date.now(),
    },
    {
      id: 'p003',
      name: 'Clutch de Festa Glam',
      price: 129.90,
      category: 'clutches',
      emoji: '👝',
      img: '',
      short: 'A peça certa para arrasar em eventos especiais.',
      description: 'Clutch estruturada com detalhes dourados, fecho magnético, corrente removível e espelho interno. Perfeita para casamentos, formaturas e jantares especiais.',
      stock: 'disponivel',
      featured: false,
      createdAt: Date.now(),
    },
    {
      id: 'p004',
      name: 'Necessaire Organizadora',
      price: 69.90,
      category: 'necessaires',
      emoji: '💼',
      img: '',
      short: 'Indispensável para viagens — impermeável e compacta.',
      description: 'Necessaire em tecido impermeável com divisórias internas, zíper duplo e alça de mão. Ideal para organizar cosméticos, remédios ou acessórios. Ótima opção de presente!',
      stock: 'disponivel',
      featured: false,
      createdAt: Date.now(),
    },
    {
      id: 'p005',
      name: 'Mini Bag Romântica',
      price: 99.90,
      category: 'minibags',
      emoji: '🌸',
      img: '',
      short: 'Pequena, leve e cheia de charme para saídas rápidas.',
      description: 'Mini Bag com corrente dourada, fechamento com zíper, forro de cetim e espaço para celular, carteira e batom. Cabe o essencial com muito estilo.',
      stock: 'disponivel',
      featured: true,
      createdAt: Date.now(),
    },
    {
      id: 'p006',
      name: 'Bolsa Shoulder Boho',
      price: 159.90,
      category: 'totes',
      emoji: '🌿',
      img: '',
      short: 'Estilo boho-chic com muito espaço e personalidade.',
      description: 'Bolsa transversal com alça longa regulável, detalhes em macramê, bolso frontal com fecho magnético e forro estampado. Uma peça que conta histórias.',
      stock: 'encomenda',
      featured: false,
      createdAt: Date.now(),
    },
    {
      id: 'p007',
      name: 'Bolsa Bucket Luxo',
      price: 179.90,
      category: 'totes',
      emoji: '🪣',
      img: '',
      short: 'Formato bucket com fechamento de cordão e muito charme.',
      description: 'Bolsa no estilo bucket bag com fechamento em cordão, alça transversal removível, bolso interno e base reforçada. Fabricada com sintético premium de alta qualidade.',
      stock: 'disponivel',
      featured: false,
      createdAt: Date.now(),
    },
    {
      id: 'p008',
      name: 'Kit Viagem Completo',
      price: 249.90,
      category: 'necessaires',
      emoji: '✈️',
      img: '',
      short: 'Conjunto com 3 necessaires organizadoras de tamanhos variados.',
      description: 'Kit com 3 necessaires (G, M, P) em tecido impermeável, fechamento com zíper de qualidade, alças resistentes e interior em cor clara para fácil localização dos itens. Presente ideal!',
      stock: 'encomenda',
      featured: true,
      createdAt: Date.now(),
    },
  ];

  // ─── Inicialização ────────────────────────────────────────────────────────
  function init() {
    if (!localStorage.getItem(KEYS.products)) {
      localStorage.setItem(KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.orders)) {
      localStorage.setItem(KEYS.orders, JSON.stringify([]));
    }
  }

  // ─── Produtos ─────────────────────────────────────────────────────────────
  function getProducts() {
    return JSON.parse(localStorage.getItem(KEYS.products) || '[]');
  }

  function getProduct(id) {
    return getProducts().find(p => p.id === id) || null;
  }

  function saveProduct(data) {
    const products = getProducts();
    const existing = products.findIndex(p => p.id === data.id);
    if (existing >= 0) {
      products[existing] = { ...products[existing], ...data };
    } else {
      data.id = 'p' + Date.now();
      data.createdAt = Date.now();
      products.unshift(data);
    }
    localStorage.setItem(KEYS.products, JSON.stringify(products));
    return data;
  }

  function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.products, JSON.stringify(products));
  }

  function getByCategory(cat) {
    const all = getProducts();
    return cat === 'todas' ? all : all.filter(p => p.category === cat);
  }

  // ─── Pedidos ──────────────────────────────────────────────────────────────
  function getOrders() {
    return JSON.parse(localStorage.getItem(KEYS.orders) || '[]');
  }

  function saveOrder(order) {
    const orders = getOrders();
    order.id = 'ord' + Date.now();
    order.createdAt = new Date().toISOString();
    orders.unshift(order);
    localStorage.setItem(KEYS.orders, JSON.stringify(orders));
    return order;
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────
  function formatPrice(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return { init, getProducts, getProduct, saveProduct, deleteProduct, getByCategory, getOrders, saveOrder, formatPrice };
})();

DB.init();
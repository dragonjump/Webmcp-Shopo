/**
 * Shop0 app — wiring listing, filters, and cart.
 */

import { getProducts, recommendSize } from './data.js';
import { getFilterState, applyFilters, clearFilters } from './filters.js';
import {
  addToCart,
  getCart,
  getCartCount,
  resetCart,
  openAddToCartModal,
  openCartModal,
  closeCartModal,
  bindCartUI,
  updateCartCountInHeader,
} from './cart.js';
import { registerWebMCP } from './webmcp.js';

let allProducts = [];
let filteredProducts = [];

let imageModalScale = 1;
const IMAGE_MODAL_MIN = 0.25;
const IMAGE_MODAL_MAX = 4;
const IMAGE_MODAL_STEP = 0.25;

function renderListing() {
  const grid = document.getElementById('listingGrid');
  const emptyEl = document.getElementById('listingEmpty');
  if (!grid) return;

  if (filteredProducts.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  grid.innerHTML = filteredProducts
    .map(
      (p) => `
    <article class="product-card" data-product-id="${p.id}">
      <img class="card-image ${p.logo === 'small' ? 'card-image-sepia' : ''}" src="${p.image || 'image/small.png'}" alt="Pure Man Kurta Green — Size ${p.size}, ${p.logo === 'big' ? 'Big' : 'Small'} logo" loading="lazy">
      <div class="card-body">
        <span class="card-size">Size ${p.size}</span>
        <span class="card-meta">${p.logo === 'big' ? 'Big logo' : 'Small logo'}</span>
        <span class="card-price">RM ${p.price}</span>
        <span class="card-rating">★ ${p.rating} (${p.reviewCount} review${p.reviewCount !== 1 ? 's' : ''})</span>
        ${p.recommendedFor && p.recommendedFor.length ? `<span class="card-recommend">Recommended for: ${p.recommendedFor.join(', ')}</span>` : ''}
        <button type="button" class="btn-select" data-product-id="${p.id}">Select</button>
      </div>
    </article>
  `
    )
    .join('');

  grid.querySelectorAll('.btn-select').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = filteredProducts.find((x) => x.id === btn.dataset.productId);
      if (product) openAddToCartModal(product, (item) => { addToCart(item); updateCartCountInHeader(); });
    });
  });
}

function openImageModal(src, alt) {
  const overlay = document.getElementById('imageModal');
  const img = document.getElementById('imageModalImg');
  if (!overlay || !img) return;
  img.src = src;
  img.alt = alt || 'Product image';
  imageModalScale = 1;
  img.style.transform = `scale(${imageModalScale})`;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeImageModal() {
  const overlay = document.getElementById('imageModal');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

function applyImageModalZoom() {
  const img = document.getElementById('imageModalImg');
  if (img) img.style.transform = `scale(${imageModalScale})`;
}

function initImageModal() {
  const overlay = document.getElementById('imageModal');
  const img = document.getElementById('imageModalImg');
  const scrollEl = document.getElementById('imageModalScroll');
  const zoomInBtn = document.getElementById('imageModalZoomIn');
  const zoomOutBtn = document.getElementById('imageModalZoomOut');
  const zoomResetBtn = document.getElementById('imageModalZoomReset');
  const closeBtn = document.getElementById('imageModalClose');

  if (!overlay || !img || !scrollEl) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeImageModal();
  });
  closeBtn.addEventListener('click', closeImageModal);
  zoomInBtn.addEventListener('click', () => {
    imageModalScale = Math.min(IMAGE_MODAL_MAX, imageModalScale + IMAGE_MODAL_STEP);
    applyImageModalZoom();
  });
  zoomOutBtn.addEventListener('click', () => {
    imageModalScale = Math.max(IMAGE_MODAL_MIN, imageModalScale - IMAGE_MODAL_STEP);
    applyImageModalZoom();
  });
  zoomResetBtn.addEventListener('click', () => {
    imageModalScale = 1;
    applyImageModalZoom();
  });

  scrollEl.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (e.deltaY < 0) imageModalScale = Math.min(IMAGE_MODAL_MAX, imageModalScale + 0.1);
    else imageModalScale = Math.max(IMAGE_MODAL_MIN, imageModalScale - 0.1);
    applyImageModalZoom();
  }, { passive: false });

  document.getElementById('listingGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('card-image')) openImageModal(e.target.src, e.target.alt);
  });
}

function runFilters() {
  const state = getFilterState();
  filteredProducts = applyFilters(allProducts, state);
  renderListing();
}

function initRecommendSize() {
  const btn = document.getElementById('recommendSize');
  const heightEl = document.getElementById('heightCm');
  const weightEl = document.getElementById('weightKg');
  const textEl = document.getElementById('recommendText');
  if (!btn || !heightEl || !weightEl || !textEl) return;
  btn.addEventListener('click', () => {
    const h = Number(heightEl.value);
    const w = Number(weightEl.value);
    const size = recommendSize(h, w);
    textEl.textContent = size ? `Recommended size: ${size}` : 'Enter height and weight for a recommendation.';
  });
}

function init() {
  allProducts = getProducts();
  filteredProducts = [...allProducts];

  document.getElementById('applyFilters').addEventListener('click', runFilters);
  document.getElementById('clearFilters').addEventListener('click', () => {
    clearFilters();
    filteredProducts = [...allProducts];
    renderListing();
  });

  initRecommendSize();
  initImageModal();
  bindCartUI(() => openCartModal(updateCartCountInHeader));
  const addToCartOverlay = document.getElementById('addToCartModal');
  document.getElementById('modalClose').addEventListener('click', () => {
    if (addToCartOverlay) addToCartOverlay.classList.add('hidden');
    if (typeof window.__closeAddToCartModal === 'function') window.__closeAddToCartModal();
  });
  addToCartOverlay.addEventListener('click', (e) => {
    if (e.target === addToCartOverlay) {
      addToCartOverlay.classList.add('hidden');
      if (typeof window.__closeAddToCartModal === 'function') window.__closeAddToCartModal();
    }
  });
  renderListing();
  updateCartCountInHeader();

  registerWebMCP({
    getProducts,
    recommendSize,
    addToCart,
    getCart,
    getCartCount,
    resetCart,
    updateCartCountInHeader,
    applyFilters,
  });
}

init();

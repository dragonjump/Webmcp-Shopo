/**
 * Cart state and add-to-cart modal.
 */

let cart = [];

export function getCart() {
  return [...cart];
}

export function addToCart(item) {
  cart.push({
    id: item.id,
    name: item.name,
    size: item.size,
    logo: item.logo,
    price: item.price,
    qty: item.qty || 1,
    note: item.note || '',
  });
}

export function resetCart() {
  cart = [];
}

export function getCartCount() {
  return cart.reduce((sum, i) => sum + (i.qty || 1), 0);
}

export function setCartCountEl(el) {
  if (!el) return;
  el.textContent = String(getCartCount());
}

function renderCartItems(container, emptyEl) {
  const items = getCart();
  if (!container) return;
  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyEl) {
      emptyEl.classList.remove('hidden');
    }
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  container.innerHTML = items
    .map(
      (i) =>
        `<div class="cart-item">
          <strong>${escapeHtml(i.name)}</strong> — ${i.size}${i.logo ? `, ${i.logo === 'big' ? 'Big' : 'Small'} logo` : ''}<br>
          Qty: ${i.qty} × RM ${i.price} ${i.note ? `<br>Note: ${escapeHtml(i.note)}` : ''}
        </div>`
    )
    .join('');
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/**
 * Open add-to-cart modal for a product.
 * @param { { id: string, name: string, size: string, logo: string, price: number } } product
 * @param { (item: object) => void } onAdd - called when user submits add to cart
 */
export function openAddToCartModal(product, onAdd) {
  const overlay = document.getElementById('addToCartModal');
  const form = document.getElementById('addToCartForm');
  const productId = document.getElementById('modalProductId');
  const productName = document.getElementById('modalProductName');
  const sizeEl = document.getElementById('modalSize');
  const qtyEl = document.getElementById('modalQty');
  const noteEl = document.getElementById('modalNote');

  if (!overlay || !form || !productId || !productName || !sizeEl || !qtyEl) return;

  productId.value = product.id;
  productName.textContent = product.name;
  sizeEl.textContent = product.size;
  qtyEl.value = 1;
  if (noteEl) noteEl.value = '';
  const logoRadios = form.querySelectorAll('input[name="modalLogo"]');
  const preferredLogo = product.logo || 'big';
  logoRadios.forEach((radio) => { radio.checked = radio.value === preferredLogo; });
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  qtyEl.focus();

  const submit = (e) => {
    e.preventDefault();
    const qty = parseInt(qtyEl.value, 10) || 1;
    const note = (noteEl && noteEl.value) || '';
    const checkedLogo = form.querySelector('input[name="modalLogo"]:checked');
    const logo = (checkedLogo && checkedLogo.value) || 'big';
    onAdd({
      ...product,
      logo,
      qty,
      note,
    });
    closeAddToCartModal();
  };

  const close = () => {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    form.removeEventListener('submit', submit);
  };

  form.addEventListener('submit', submit);
  window.__closeAddToCartModal = close;

  function closeAddToCartModal() {
    close();
  }
}

/**
 * Open cart modal and render items. Update count in header.
 * @param { () => void } [onReset] - called when user clicks Reset (e.g. to refresh UI)
 */
export function openCartModal(onReset) {
  const overlay = document.getElementById('cartModal');
  const container = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  if (!overlay) return;
  renderCartItems(container, emptyEl);
  setCartCountEl(document.getElementById('cartCount'));
  const resetBtn = document.getElementById('cartReset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      resetCart();
      renderCartItems(container, emptyEl);
      setCartCountEl(document.getElementById('cartCount'));
      if (onReset) onReset();
    };
  }
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeCartModal() {
  const overlay = document.getElementById('cartModal');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

export function bindCartUI(onOpenCart) {
  const trigger = document.getElementById('cartTrigger');
  const closeBtn = document.getElementById('cartModalClose');
  if (trigger) trigger.addEventListener('click', () => (onOpenCart ? onOpenCart() : openCartModal()));
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);
}

export function updateCartCountInHeader() {
  setCartCountEl(document.getElementById('cartCount'));
}

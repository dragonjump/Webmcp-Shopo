/**
 * Filter logic for product listing.
 * Reads filter UI state and returns filtered product list.
 */

/**
 * Get current filter state from the DOM.
 * @returns { { sizes: string[], logo: string, priceMin?: number, priceMax?: number, bodyType: string, minRating: number } }
 */
export function getFilterState() {
  const sizeCheckboxes = document.querySelectorAll('input[name="size"]:checked');
  const sizes = Array.from(sizeCheckboxes).map((el) => el.value);

  const logoRadio = document.querySelector('input[name="logo"]:checked');
  const logo = (logoRadio && logoRadio.value) || '';

  const priceMinEl = document.getElementById('priceMin');
  const priceMaxEl = document.getElementById('priceMax');
  const priceMin = priceMinEl && priceMinEl.value !== '' ? Number(priceMinEl.value) : undefined;
  const priceMax = priceMaxEl && priceMaxEl.value !== '' ? Number(priceMaxEl.value) : undefined;

  const bodyTypeEl = document.getElementById('bodyType');
  const bodyType = (bodyTypeEl && bodyTypeEl.value) || '';

  const minRatingEl = document.getElementById('minRating');
  const minRating = minRatingEl ? Number(minRatingEl.value) : 0;

  return { sizes, logo, priceMin, priceMax, bodyType, minRating };
}

/**
 * Apply filters to product list.
 * @param { import('./data.js').getProducts extends () => infer R ? R : never } products
 * @param { ReturnType<typeof getFilterState> } state
 * @returns { typeof products }
 */
export function applyFilters(products, state) {
  let result = [...products];

  if (state.sizes.length > 0) {
    result = result.filter((p) => state.sizes.includes(p.size));
  }

  if (state.logo) {
    result = result.filter((p) => p.logo === state.logo);
  }

  if (state.priceMin != null && !Number.isNaN(state.priceMin)) {
    result = result.filter((p) => p.price >= state.priceMin);
  }
  if (state.priceMax != null && !Number.isNaN(state.priceMax)) {
    result = result.filter((p) => p.price <= state.priceMax);
  }

  if (state.bodyType) {
    result = result.filter((p) => (p.recommendedFor || []).includes(state.bodyType));
  }

  if (state.minRating > 0) {
    result = result.filter((p) => p.rating >= state.minRating);
  }

  return result;
}

/**
 * Clear all filter inputs and reset to defaults.
 */
export function clearFilters() {
  document.querySelectorAll('input[name="size"]').forEach((el) => (el.checked = false));
  const anyLogo = document.querySelector('input[name="logo"][value=""]');
  if (anyLogo) anyLogo.checked = true;
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) priceMin.value = '';
  if (priceMax) priceMax.value = '';
  const bodyType = document.getElementById('bodyType');
  if (bodyType) bodyType.value = '';
  const minRating = document.getElementById('minRating');
  if (minRating) minRating.value = '0';
  const recommendText = document.getElementById('recommendText');
  if (recommendText) recommendText.textContent = '';
}

/**
 * WebMCP tool registration for Shop0.
 * Exposes cart, size recommendation, and product listing as agent-callable tools.
 */

function textResult(text) {
  return { content: [{ type: 'text', text: String(text) }] };
}

const WEBMCP_TOOL_NAMES = [
  'add_to_cart',
  'get_size_recommendation',
  'get_cart_summary',
  'reset_cart',
  'list_products',
];

/**
 * Register all Shop0 WebMCP tools. Call once after app init.
 * @param { {
 *   getProducts: () => Array<{ id: string, name: string, size: string, price: number }>,
 *   recommendSize: (heightCm: number, weightKg: number) => string | null,
 *   addToCart: (item: object) => void,
 *   getCart: () => Array<object>,
 *   getCartCount: () => number,
 *   resetCart: () => void,
 *   updateCartCountInHeader: () => void,
 *   applyFilters: (products: Array<object>, state: object) => Array<object>
 * } } deps
 */
export function registerWebMCP(deps) {
  if (!navigator.modelContext) return;

  const {
    getProducts,
    recommendSize,
    addToCart,
    getCart,
    getCartCount,
    resetCart,
    updateCartCountInHeader,
    applyFilters,
  } = deps;

  navigator.modelContext.registerTool({
    name: 'add_to_cart',
    description: 'Add Pure Man Kurta Green to the cart. Requires size (S, M, L, XL) and logo (big or small). Optional: qty (default 1), note. Returns new cart item count.',
    inputSchema: {
      type: 'object',
      properties: {
        size: { type: 'string', enum: ['S', 'M', 'L', 'XL'] },
        logo: { type: 'string', enum: ['big', 'small'] },
        qty: { type: 'integer', minimum: 1, default: 1 },
        note: { type: 'string', maxLength: 500 },
      },
      required: ['size', 'logo'],
    },
    async execute(input) {
      const logo = input.logo || 'big';
      const product = getProducts().find((p) => p.size === input.size && p.logo === logo);
      if (!product) return textResult('Invalid size or logo. Use S, M, L, or XL and big or small.');
      addToCart({
        ...product,
        logo,
        qty: input.qty ?? 1,
        note: input.note ?? '',
      });
      updateCartCountInHeader();
      const count = getCartCount();
      return textResult(`Added to cart. Cart has ${count} item(s).`);
    },
  });

  navigator.modelContext.registerTool({
    name: 'get_size_recommendation',
    description: 'Recommend kurta size from height (cm) and weight (kg). Returns S, M, L, or XL. Does not modify any state.',
    inputSchema: {
      type: 'object',
      properties: {
        heightCm: { type: 'number', minimum: 140, maximum: 220 },
        weightKg: { type: 'number', minimum: 40, maximum: 150 },
      },
      required: ['heightCm', 'weightKg'],
    },
    annotations: { readOnlyHint: true },
    async execute(input) {
      const size = recommendSize(input.heightCm, input.weightKg);
      return textResult(size ? `Recommended size: ${size}` : 'Enter height and weight for a recommendation.');
    },
  });

  navigator.modelContext.registerTool({
    name: 'get_cart_summary',
    description: 'Return current cart item count and a short summary of items (name, size, logo, qty, price in RM). Does not modify the cart.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    async execute() {
      const items = getCart();
      const count = getCartCount();
      if (items.length === 0) return textResult('Cart is empty.');
      const lines = items.map((i) => `${i.name} ${i.size} ${i.logo === 'big' ? 'Big' : 'Small'} logo × ${i.qty} — RM ${i.price}`);
      return textResult(`Cart: ${count} item(s). ${lines.join('; ')}`);
    },
  });

  navigator.modelContext.registerTool({
    name: 'reset_cart',
    description: 'Clear all items from the cart. Use when the user wants to start over.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      resetCart();
      updateCartCountInHeader();
      return textResult('Cart cleared.');
    },
  });

  navigator.modelContext.registerTool({
    name: 'list_products',
    description: 'List Pure Man Kurta products, optionally filtered by size(s), price range (RM), body type, or min rating. Returns count and summary. Does not change UI filters.',
    inputSchema: {
      type: 'object',
      properties: {
        sizes: { type: 'array', items: { type: 'string', enum: ['S', 'M', 'L', 'XL'] } },
        logo: { type: 'string', enum: ['big', 'small'] },
        priceMin: { type: 'number', minimum: 0 },
        priceMax: { type: 'number', minimum: 0 },
        bodyType: { type: 'string', enum: ['fit', 'fat', 'chubby', 'large', 'xl'] },
        minRating: { type: 'integer', minimum: 0, maximum: 5 },
      },
    },
    annotations: { readOnlyHint: true },
    async execute(input) {
      const products = getProducts();
      const state = {
        sizes: input.sizes && input.sizes.length ? input.sizes : [],
        logo: input.logo || '',
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        bodyType: input.bodyType || '',
        minRating: input.minRating ?? 0,
      };
      const filtered = applyFilters(products, state);
      if (filtered.length === 0) return textResult('No products match the filters.');
      const summary = filtered.map((p) => `Size ${p.size} — RM ${p.price}, ★ ${p.rating}`).join('; ');
      return textResult(`${filtered.length} product(s): ${summary}`);
    },
  });
}

/**
 * Unregister all Shop0 WebMCP tools. Call on teardown if needed.
 */
export function unregisterWebMCP() {
  if (!navigator.modelContext) return;
  WEBMCP_TOOL_NAMES.forEach((name) => {
    try {
      navigator.modelContext.unregisterTool(name);
    } catch (_) {}
  });
}

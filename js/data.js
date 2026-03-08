/**
 * Mock product data for Shop0 — Pure Man Kurta Green.
 * One product per size (S, M, L, XL). Logo style chosen when adding to cart. Prices in MYR.
 */

const BASE_PRICE_MYR = 50;
const PRICE_SPREAD = 0.1; // 10% by size

const BODY_TYPES = ['fit', 'fat', 'chubby', 'large', 'xl'];
const SIZES = ['S', 'M', 'L', 'XL'];
const LOGO_STYLES = ['big', 'small'];

const SIZE_TO_BODY = {
  S: ['fit'],
  M: ['fit', 'chubby'],
  L: ['chubby', 'fat', 'large'],
  XL: ['large', 'xl', 'fat'],
};

const MOCK_REVIEWS = {
  'S-big': [{ rating: 5 }, { rating: 4 }, { rating: 3 }, { rating: 5 }, { rating: 2 }],
  'S-small': [{ rating: 4 }, { rating: 3 }, { rating: 4 }],
  'M-big': [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 3 }, { rating: 4 }, { rating: 5 }],
  'M-small': [{ rating: 4 }, { rating: 3 }, { rating: 2 }, { rating: 4 }],
  'L-big': [{ rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 3 }],
  'L-small': [{ rating: 3 }, { rating: 4 }, { rating: 5 }, { rating: 3 }],
  'XL-big': [{ rating: 5 }, { rating: 4 }, { rating: 5 }, { rating: 4 }, { rating: 3 }],
  'XL-small': [{ rating: 4 }, { rating: 2 }, { rating: 4 }, { rating: 5 }],
};

function getPriceMyr(size, logo) {
  const idx = SIZES.indexOf(size) + (logo === 'small' ? 4 : 0);
  const factor = 1 + (idx * 0.02) - PRICE_SPREAD / 2;
  return Math.round(BASE_PRICE_MYR * factor);
}

function getAvgRating(size, logo) {
  const reviews = MOCK_REVIEWS[`${size}-${logo}`] || [];
  if (reviews.length === 0) return 4;
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function getReviewCount(size, logo) {
  return (MOCK_REVIEWS[`${size}-${logo}`] || []).length;
}

const SIZE_IMAGE = { S: 'image/small.png', M: 'image/medium.png', L: 'image/large.png', XL: 'image/extra-large.png' };
function getImagePath(size) {
  return SIZE_IMAGE[size] || 'image/small.png';
}

/** Returns products per size and logo (S/M/L/XL × big/small logo). */
export function getProducts() {
  const list = [];
  for (const size of SIZES) {
    for (const logo of LOGO_STYLES) {
      list.push({
        id: `kurta-${size}-${logo}`,
        sku: `kurta-${size}-${logo}`,
        name: 'Pure Man Kurta Green',
        size,
        logo,
        price: getPriceMyr(size, logo),
        rating: getAvgRating(size, logo),
        reviewCount: getReviewCount(size, logo),
        recommendedFor: SIZE_TO_BODY[size] || [],
        image: getImagePath(size),
      });
    }
  }
  return list;
}

/**
 * Recommend size from height (cm) and weight (kg). Hardcoded logical ranges.
 * Each size: [minHeight, maxHeight, minWeight, maxWeight].
 */
const SIZE_RANGES = [
  { size: 'S', minH: 150, maxH: 165, minW: 45, maxW: 58 },
  { size: 'M', minH: 163, maxH: 175, minW: 55, maxW: 70 },
  { size: 'L', minH: 172, maxH: 182, minW: 65, maxW: 82 },
  { size: 'XL', minH: 178, maxH: 200, minW: 75, maxW: 120 },
];

export function recommendSize(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w || h < 100 || w < 30) return null;
  for (const r of SIZE_RANGES) {
    if (h >= r.minH && h <= r.maxH && w >= r.minW && w <= r.maxW) return r.size;
  }
  if (h <= 165 && w <= 58) return 'S';
  if (h <= 175 && w <= 70) return 'M';
  if (h <= 182 && w <= 82) return 'L';
  return 'XL';
}

export { SIZES, LOGO_STYLES, BODY_TYPES, SIZE_TO_BODY };

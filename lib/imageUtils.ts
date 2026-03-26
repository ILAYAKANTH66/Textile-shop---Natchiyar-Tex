export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1610030469668-3c3a9e2ca61c",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
  "https://images.unsplash.com/photo-1593032465171-8c3c8c1a6d1b"
];

export function getProductImages(product: any): string[] {
  if (!product) return FALLBACK_IMAGES;
  
  // 1. product.images (if exists and length >= 3)
  if (product.images && Array.isArray(product.images) && product.images.length >= 3) {
    if (typeof product.images[0] === 'string') {
      return product.images;
    }
  }

  // 2. product.imageUrl + fallbacks
  const results = [];
  if (product.imageUrl) {
    results.push(product.imageUrl);
  }
  
  while (results.length < 3) {
    results.push(FALLBACK_IMAGES[results.length]);
  }
  
  return results;
}

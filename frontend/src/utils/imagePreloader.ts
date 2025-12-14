/**
 * Preload images to improve perceived performance
 * Uses browser's native image caching
 */

const preloadedImages = new Set<string>();

/**
 * Preload a single image
 */
export function preloadImage(url: string): Promise<void> {
  // Skip if already preloaded
  if (preloadedImages.has(url)) {
    return Promise.resolve();
  }

  return new Promise((resolve, _) => {
    const img = new Image();

    img.onload = () => {
      preloadedImages.add(url);
      resolve();
    };

    img.onerror = () => {
      // Don't reject - just resolve so we don't block on missing images
      resolve();
    };

    img.src = url;
  });
}

/**
 * Preload multiple images in parallel
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const uniqueUrls = [...new Set(urls)]; // Remove duplicates
  return Promise.all(uniqueUrls.map(preloadImage));
}

/**
 * Check if an image is already preloaded
 */
export function isImagePreloaded(url: string): boolean {
  return preloadedImages.has(url);
}

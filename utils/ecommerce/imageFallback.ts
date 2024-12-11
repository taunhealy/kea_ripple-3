import { useState, useEffect } from 'react';

export function useImageFallback(src: string, fallbackSrc: string): string {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImageSrc(src);
    img.onerror = () => setImageSrc(fallbackSrc);
  }, [src, fallbackSrc]);

  return imageSrc;
}


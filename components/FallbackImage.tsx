'use client';

import { ImgHTMLAttributes, useState } from 'react';

export default function FallbackImage({ src, alt, fallbackSrc = '/fallback.jpg', ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc as string}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}

'use client'

import { useState } from 'react'
import { cn } from '../utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  src: string
  alt: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  fallbackSrc = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/2f/33/2d/healthy-bowl-frische.jpg?w=900&h=500&s=1',
  ...props 
}: OptimizedImageProps) {
  // Use fallback if src is empty/null to avoid browser downloading whole page
  const initialSrc = src && src.trim() ? src : fallbackSrc
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [isError, setIsError] = useState(!src || !src.trim())

  return (
    <img
      {...props}
      src={isError ? fallbackSrc : imgSrc}
      alt={alt}
      className={cn(className, isError && 'opacity-50')}
      onError={() => {
        setIsError(true)
        setImgSrc(fallbackSrc)
      }}
      loading="lazy"
    />
  )
}

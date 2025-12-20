'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '../utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  fallbackSrc = '/images/placeholder-food.jpg',
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)

  return (
    <Image
      {...props}
      src={isError ? fallbackSrc : imgSrc}
      alt={alt}
      className={cn(className, isError && 'opacity-50')}
      onError={() => {
        setIsError(true)
        setImgSrc(fallbackSrc)
      }}
      loading="lazy"
      quality={85}
    />
  )
}

"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { log } from './logger'

const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true'

export function RouteEnterLogger() {
  const pathname = usePathname()

  useEffect(() => {
    if (!USE_LOGGING || !pathname) return

    log('nav', 'Route enter', { pathname }, { feature: 'routing', dedupeTtlMs: 3000 })
  }, [pathname])

  return null
}

export default RouteEnterLogger

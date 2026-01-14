'use client'

import { useState, useEffect } from 'react'

export type Language = 'EN' | 'VI'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('EN')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) {
      setLanguage(saved)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return {
    language,
    setLanguage: changeLanguage,
  }
}

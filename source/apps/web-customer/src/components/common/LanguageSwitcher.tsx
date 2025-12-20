import { Globe } from 'lucide-react'

export type Language = 'EN' | 'VI'

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-white border border-[var(--gray-200)] rounded-full px-3 py-1.5">
      <Globe className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
      <button
        onClick={() => onLanguageChange('EN')}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          currentLanguage === 'EN'
            ? 'bg-[var(--orange-500)] text-white'
            : 'text-[var(--gray-700)] hover:bg-[var(--gray-100)]'
        }`}
        style={{ fontSize: '13px' }}
      >
        EN
      </button>
      <span style={{ color: 'var(--gray-300)' }}>|</span>
      <button
        onClick={() => onLanguageChange('VI')}
        className={`px-2 py-0.5 rounded-full transition-colors ${
          currentLanguage === 'VI'
            ? 'bg-[var(--orange-500)] text-white'
            : 'text-[var(--gray-700)] hover:bg-[var(--gray-100)]'
        }`}
        style={{ fontSize: '13px' }}
      >
        VI
      </button>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react'
import { OptimizedImage } from '@packages/ui'

interface ItemHeroSectionProps {
  imageUrl: string
  name: string
  onBack: () => void
}

export function ItemHeroSection({ imageUrl, name, onBack }: ItemHeroSectionProps) {
  return (
    <div className="relative">
      <OptimizedImage
        src={imageUrl}
        alt={name}
        className="w-full h-64 object-cover"
      />
      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-md transition-all active:scale-95 hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
      </button>
    </div>
  )
}

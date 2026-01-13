import { MenuPage } from '@/features/menu'
import { FeatureErrorBoundary } from '@/shared/components/error'

export default function Menu() {
  return (
    <FeatureErrorBoundary>
      <MenuPage />
    </FeatureErrorBoundary>
  )
}

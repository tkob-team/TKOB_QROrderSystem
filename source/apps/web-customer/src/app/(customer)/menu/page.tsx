import { MenuPage } from '@/features/menu/MenuPage'
import { FeatureErrorBoundary } from '@/components/error'

export default function Menu() {
  return (
    <FeatureErrorBoundary>
      <MenuPage />
    </FeatureErrorBoundary>
  )
}

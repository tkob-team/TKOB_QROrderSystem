import { ItemDetailPage } from '@/features/item-detail/ItemDetailPage'
import { FeatureErrorBoundary } from '@/components/error'

type Params = Promise<{ itemId: string }>

export default async function ItemDetail(props: { params: Params }) {
  const params = await props.params
  return (
    <FeatureErrorBoundary>
      <ItemDetailPage itemId={params.itemId} />
    </FeatureErrorBoundary>
  )
}

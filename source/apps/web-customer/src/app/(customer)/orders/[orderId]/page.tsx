import { OrderDetailPage } from '@/features/orders/OrderDetailPage'

type Params = Promise<{ orderId: string }>

export default async function OrderDetail(props: { params: Params }) {
  const params = await props.params
  return <OrderDetailPage orderId={params.orderId} />
}

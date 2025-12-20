import { OrderConfirmationPage } from '@/features/orders/OrderConfirmationPage'

type SearchParams = Promise<{ orderId?: string }>

export default async function PaymentSuccess(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const orderId = searchParams.orderId || ''
  
  return <OrderConfirmationPage orderId={orderId} />
}

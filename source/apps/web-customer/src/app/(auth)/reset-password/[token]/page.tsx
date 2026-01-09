import { ResetPasswordTokenPage } from '@/features/auth'

type Params = Promise<{ token: string }>

export default async function ResetPasswordWithToken(props: { params: Params }) {
  const params = await props.params
  return <ResetPasswordTokenPage token={params.token} />
}

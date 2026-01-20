import { redirect } from 'next/navigation'

/**
 * Redirect /auth to /login
 */
export default function AuthIndexRedirect() {
  redirect('/login')
}

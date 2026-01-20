import { redirect } from 'next/navigation'

/**
 * Redirect /auth/login to /login
 * This ensures both route patterns work for backward compatibility
 */
export default function AuthLoginRedirect() {
  redirect('/login')
}

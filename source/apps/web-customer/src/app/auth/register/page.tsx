import { redirect } from 'next/navigation'

/**
 * Redirect /auth/register to /register
 * This ensures both route patterns work for backward compatibility
 */
export default function AuthRegisterRedirect() {
  redirect('/register')
}

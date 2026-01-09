'use client'

export function ResetPasswordSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl mb-4">Password Reset Successful</h1>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        <a 
          href="/login" 
          className="inline-block py-3 px-6 rounded-full text-white"
          style={{ backgroundColor: 'var(--orange-500)' }}
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}

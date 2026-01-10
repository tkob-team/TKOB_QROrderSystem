'use client'

export function EmailVerificationFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl mb-4 text-red-600">Verification Failed</h1>
        <p className="text-gray-600 mb-6">
          The verification link is invalid or has expired. 
          Please request a new verification email.
        </p>
      </div>
    </div>
  )
}

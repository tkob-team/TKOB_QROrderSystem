'use client';

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Branding */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-600">
            TKOB Order
          </h1>
          <p className="text-lg text-gray-600">
            Restaurant Ordering System
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Scan QR Code to Start
          </h2>

          <div className="text-left space-y-3 text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <p>Find the QR code on your table</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <p>Scan it with your phone camera</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <p>Browse menu and place your order</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-500">
          No app download required • Quick & Easy ordering
        </p>
      </div>
    </main>
  );
}

import { AlertTriangle } from 'lucide-react';

interface QRInvalidProps {
  onClose?: () => void;
}

export function QRInvalidPage({ onClose }: QRInvalidProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-md text-center">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <AlertTriangle className="w-10 h-10" style={{ color: '#F59E0B' }} />
          </div>
        </div>

        {/* Content */}
        <h1 className="mb-3" style={{ color: '#111827' }}>
          Invalid QR Code
        </h1>
        <p className="mb-8" style={{ color: '#6B7280', lineHeight: '1.6', fontSize: '15px' }}>
          This QR code is not valid or has expired. Please scan a new QR code from your table or ask staff for assistance.
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-98"
          style={{
            backgroundColor: '#F97316',
            color: 'white',
            minHeight: '48px',
          }}
        >
          Try Again
        </button>

        {/* Helper Text */}
        <p className="mt-6" style={{ color: '#9CA3AF', fontSize: '14px' }}>
          Need help? Call a staff member or go to the counter.
        </p>
      </div>
    </div>
  );
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, QrCode, X, Loader2 } from 'lucide-react'
import { AppHeader } from '@/shared/components/layout/AppHeader'

export function ScanQRPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const startCamera = async () => {
    setError(null)
    setIsScanning(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start scanning for QR codes
        startQRScanning()
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please grant camera permission and try again.')
      setIsScanning(false)
    }
  }

  const startQRScanning = () => {
    // Use BarcodeDetector API if available (Chrome, Edge)
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code']
      })

      const scanFrame = async () => {
        if (!videoRef.current || !streamRef.current) return

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current)
          
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            handleQRDetected(qrData)
            return
          }
        } catch (err) {
          // Continue scanning
        }

        // Continue scanning if camera is still active
        if (streamRef.current) {
          requestAnimationFrame(scanFrame)
        }
      }

      // Start scanning after video is playing
      setTimeout(scanFrame, 500)
    } else {
      // Fallback: Show manual entry option
      setError('QR scanning is not supported in this browser. Please use Chrome or Edge, or enter the table code manually.')
    }
  }

  const handleQRDetected = (qrData: string) => {
    if (isProcessing) return
    setIsProcessing(true)
    
    stopCamera()
    
    // Try to extract route from QR data
    // Expected formats:
    // - Full URL: https://domain.com/t/tenant-slug?table=T1&token=abc123
    // - Relative: /t/tenant-slug?table=T1&token=abc123
    try {
      let path = qrData
      
      // If it's a full URL, extract the path
      if (qrData.startsWith('http')) {
        const url = new URL(qrData)
        path = url.pathname + url.search
      }
      
      // Navigate to the QR path
      if (path.startsWith('/t/')) {
        router.push(path)
      } else {
        // Invalid QR format
        setError('Invalid QR code. Please scan the QR code on your table.')
        setIsProcessing(false)
        setIsScanning(false)
      }
    } catch (err) {
      setError('Could not read QR code. Please try again.')
      setIsProcessing(false)
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <AppHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!isScanning ? (
          // Welcome/Start screen
          <div className="w-full max-w-sm text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--orange-100)' }}
            >
              <QrCode className="w-12 h-12" style={{ color: 'var(--orange-500)' }} />
            </div>
            
            <h1 className="text-2xl mb-2" style={{ color: 'var(--gray-900)', fontWeight: 600 }}>
              Scan Table QR Code
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--gray-600)', fontSize: '15px' }}>
              Point your camera at the QR code on your table to start ordering
            </p>

            {error && (
              <div 
                className="mb-6 p-4 rounded-xl text-left"
                style={{ 
                  backgroundColor: 'var(--red-50)', 
                  border: '1px solid var(--red-200)' 
                }}
              >
                <p style={{ color: 'var(--red-700)', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            <button
              onClick={startCamera}
              className="w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all hover:shadow-md active:scale-98"
              style={{
                backgroundColor: 'var(--orange-500)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                minHeight: '56px',
              }}
            >
              <Camera className="w-6 h-6" />
              <span>Start Scanning</span>
            </button>

            <p className="mt-6" style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
              Make sure to allow camera access when prompted
            </p>
          </div>
        ) : (
          // Camera/Scanning view
          <div className="w-full max-w-md">
            <div className="relative">
              {/* Camera preview */}
              <div 
                className="relative rounded-2xl overflow-hidden"
                style={{ 
                  aspectRatio: '1',
                  backgroundColor: 'black',
                }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Scanning frame */}
                  <div 
                    className="w-64 h-64 border-2 rounded-xl"
                    style={{ 
                      borderColor: 'var(--orange-500)',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl" style={{ borderColor: 'var(--orange-500)' }} />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl" style={{ borderColor: 'var(--orange-500)' }} />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl" style={{ borderColor: 'var(--orange-500)' }} />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl" style={{ borderColor: 'var(--orange-500)' }} />
                  </div>
                </div>

                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" style={{ color: 'var(--orange-500)' }} />
                      <p className="text-white">Processing QR code...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <p className="mt-6 text-center" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              Position the QR code within the frame
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

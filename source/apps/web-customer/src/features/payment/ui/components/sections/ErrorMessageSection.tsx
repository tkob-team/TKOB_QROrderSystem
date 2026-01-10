import { AlertCircle } from 'lucide-react'

interface ErrorMessageSectionProps {
  error: string
}

export function ErrorMessageSection({ error }: ErrorMessageSectionProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-800" style={{ fontSize: '14px' }}>
          {error}
        </p>
      </div>
    </div>
  )
}

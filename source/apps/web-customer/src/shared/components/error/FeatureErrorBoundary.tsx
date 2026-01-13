'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { logError } from '@/shared/logging/logger'

interface Props {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Feature-level Error Boundary
 * Shows inline error UI and allows retry
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Safety net: always log to console in case structured logging fails
    console.error('FeatureErrorBoundary caught error:', error, errorInfo)
    
    // Structured logging (gated, won't crash if logger has issues)
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      try {
        logError('ui', 'Feature component error', error, {
          feature: 'feature-error-boundary'
        })
      } catch {
        // Silent fail - console.error above is our safety net
      }
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      return (
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load this section
          </h3>
          <p className="text-gray-600 mb-4">
            {this.state.error.message || 'An error occurred'}
          </p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

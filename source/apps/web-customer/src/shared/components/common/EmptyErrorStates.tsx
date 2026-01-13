import { AlertCircle, Search, Lock, Zap } from 'lucide-react'
import { ReactElement } from 'react'
import { EmptyState } from './EmptyState'

export type ErrorStateType = 'not_found' | 'unauthorized' | 'server_error' | 'network_error' | 'no_results'

interface EmptyErrorStatesProps {
  type: ErrorStateType
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

const defaultStates: Record<ErrorStateType, { icon: ReactElement; defaultTitle: string; defaultMessage: string }> = {
  not_found: {
    icon: <Search className="w-16 h-16" />,
    defaultTitle: 'Not found',
    defaultMessage: 'The item you are looking for does not exist or has been removed.',
  },
  unauthorized: {
    icon: <Lock className="w-16 h-16" />,
    defaultTitle: 'Unauthorized',
    defaultMessage: 'You do not have permission to access this resource.',
  },
  server_error: {
    icon: <AlertCircle className="w-16 h-16" />,
    defaultTitle: 'Server error',
    defaultMessage: 'Something went wrong on our end. Please try again later.',
  },
  network_error: {
    icon: <Zap className="w-16 h-16" />,
    defaultTitle: 'Connection lost',
    defaultMessage: 'Please check your internet connection and try again.',
  },
  no_results: {
    icon: <Search className="w-16 h-16" />,
    defaultTitle: 'No results',
    defaultMessage: 'We could not find any results matching your search.',
  },
}

export function EmptyErrorStates({
  type,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyErrorStatesProps) {
  const state = defaultStates[type]

  return (
    <EmptyState
      icon={state.icon}
      title={title || state.defaultTitle}
      message={message || state.defaultMessage}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

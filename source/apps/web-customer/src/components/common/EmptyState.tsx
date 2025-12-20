import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-4" style={{ color: 'var(--gray-400)' }}>
        {icon}
      </div>
      <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
        {title}
      </h3>
      <p className="mb-6 max-w-sm" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-full transition-all hover:shadow-md active:scale-95"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

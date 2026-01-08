interface StaffToastProps {
  show: boolean;
  message: string;
}

export function StaffToast({ show, message }: StaffToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-[rgb(var(--success))] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up">
      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
        <span className="text-[rgb(var(--success))] text-xs">✓</span>
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

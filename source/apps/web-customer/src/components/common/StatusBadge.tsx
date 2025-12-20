import type { Order } from '@/types/order'

interface StatusBadgeProps {
  status: Order['status']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'var(--blue-500)',
          text: 'white',
        }
      case 'Accepted':
        return {
          bg: 'var(--blue-600)',
          text: 'white',
        }
      case 'Preparing':
        return {
          bg: 'var(--amber-500)',
          text: 'white',
        }
      case 'Ready':
        return {
          bg: 'var(--emerald-500)',
          text: 'white',
        }
      case 'Served':
        return {
          bg: 'var(--emerald-600)',
          text: 'white',
        }
      case 'Completed':
        return {
          bg: 'var(--emerald-700)',
          text: 'white',
        }
      case 'Cancelled':
        return {
          bg: 'var(--red-500)',
          text: 'white',
        }
      default:
        return {
          bg: 'var(--gray-200)',
          text: 'var(--gray-700)',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        fontSize: '13px',
      }}
    >
      {status}
    </span>
  );
}
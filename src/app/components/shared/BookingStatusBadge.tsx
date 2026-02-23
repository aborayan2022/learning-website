import type { BookingStatus } from '../../core/models/booking.model';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
  disputed: { label: 'Disputed', bg: 'bg-orange-100', text: 'text-orange-800' },
};

interface Props {
  status: BookingStatus | string;
  size?: 'sm' | 'md';
}

export default function BookingStatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium capitalize ${config.bg} ${config.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {config.label}
    </span>
  );
}

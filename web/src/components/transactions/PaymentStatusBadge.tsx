type PaymentStatusBadgeProps = {
  status: string;
};

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const statusColors: Record<string, string> = {
    done: 'bg-green-100 text-green-800',
    waiting_for_payment: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
    rejected: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

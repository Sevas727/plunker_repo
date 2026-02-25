import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  total: ClipboardDocumentListIcon,
  pending: ClockIcon,
  completed: CheckCircleIcon,
};

export default function CardWrapper({
  totalTodos,
  pendingTodos,
  completedTodos,
}: {
  totalTodos: number;
  pendingTodos: number;
  completedTodos: number;
}) {
  return (
    <>
      <Card title="Total Todos" value={totalTodos} type="total" />
      <Card title="Pending" value={pendingTodos} type="pending" />
      <Card title="Completed" value={completedTodos} type="completed" />
    </>
  );
}

function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'total' | 'pending' | 'completed';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-white/[0.03] p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-white/50" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className} truncate rounded-xl bg-white/5 px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}

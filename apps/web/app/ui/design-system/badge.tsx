import clsx from 'clsx';

type BadgeVariant = 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-gray-300',
  blue: 'bg-accent/10 text-blue-300',
  green: 'bg-green-500/10 text-green-300',
  red: 'bg-red-500/10 text-red-300',
  yellow: 'bg-yellow-500/10 text-yellow-300',
  outline: 'border border-white/10 text-white/40 bg-transparent',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from '@/utils/cn';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'busy' | 'away' | 'offline';
  className?: string;
}

export function Avatar({ name, src, size = 'md', status, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-semibold',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
  };

  const statusColors = {
    online: 'bg-green-500 ring-white',
    busy: 'bg-rose-500 ring-white',
    away: 'bg-amber-500 ring-white',
    offline: 'bg-neutral-400 ring-white',
  };

  return (
    <div className={cn('relative inline-block select-none shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-medium skeuo-raised-1 bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-700 border border-neutral-300 ring-1 ring-white/80',
          sizeStyles[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute rounded-full ring-2 shadow-sm',
            statusDotSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 3,
  size = 'sm',
}: {
  users: Array<{ name: string; avatarUrl?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} src={u.avatarUrl} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-neutral-200 text-neutral-600 font-semibold flex items-center justify-center ring-2 ring-white',
            size === 'xs' ? 'w-6 h-6 text-[10px]' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-xs'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

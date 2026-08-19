import { LeadScoreCategory } from '@/types';
import { Flame, Sun, Snowflake } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LeadScoreBadgeProps {
  score: number;
  category?: LeadScoreCategory;
  className?: string;
}

export function LeadScoreBadge({ score, category, className }: LeadScoreBadgeProps) {
  const cat: LeadScoreCategory = category || (score >= 80 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD');

  const config = {
    HOT: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: <Flame className="w-3 h-3 text-rose-600" />,
      label: 'Hot',
    },
    WARM: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: <Sun className="w-3 h-3 text-amber-600" />,
      label: 'Warm',
    },
    COLD: {
      bg: 'bg-neutral-100 border-neutral-200 text-neutral-600',
      icon: <Snowflake className="w-3 h-3 text-neutral-400" />,
      label: 'Cold',
    },
  };

  const item = config[cat];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-fib-5 px-fib-8 py-fib-2 rounded-pill border text-xs font-bold tabular-nums select-none shadow-sm relative overflow-hidden',
        item.bg,
        className
      )}
    >
      <span className="absolute top-0 left-0 right-0 h-[1px] bg-white/50 pointer-events-none" />
      {item.icon}
      <span>{score}</span>
      <span className="text-[10px] uppercase font-semibold text-neutral-500">({item.label})</span>
    </div>
  );
}

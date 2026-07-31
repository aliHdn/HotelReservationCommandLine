import { cn } from '@/lib/utils';

export function Avatar({ name, hue, size = 40, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-soft', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 38%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="text-brand-500">★</span>
      <span className="font-medium text-ink-800">{rating.toFixed(1)}</span>
    </span>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'error' | 'brand'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 text-ink-700',
    success: 'bg-teal-100 text-teal-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-700',
    brand: 'bg-brand-100 text-brand-800',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'confirmed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled') return 'error';
  return 'neutral';
}

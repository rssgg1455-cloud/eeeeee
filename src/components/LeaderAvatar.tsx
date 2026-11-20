import { cn } from '@/lib/cn';

export function LeaderAvatar({ name, avatarUrl, size, ring }: { name: string; avatarUrl: string | null; size: string; ring?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600', size, ring)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </span>
  );
}

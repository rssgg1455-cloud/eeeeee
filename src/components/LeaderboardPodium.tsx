import { LeaderAvatar } from '@/components/LeaderAvatar';
import { bdt } from '@/lib/format';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import { cn } from '@/lib/cn';
import { Crown } from 'lucide-react';

const PODIUM_STYLES: Record<number, { height: string; avatar: string; ring: string; badge: string; crown: string }> = {
  1: {
    height: 'h-40',
    avatar: 'h-20 w-20 text-2xl',
    ring: 'ring-4 ring-amber-400',
    badge: 'bg-amber-400 text-amber-900',
    crown: 'text-amber-500',
  },
  2: {
    height: 'h-32',
    avatar: 'h-16 w-16 text-xl',
    ring: 'ring-4 ring-slate-300',
    badge: 'bg-slate-300 text-slate-800',
    crown: 'text-slate-400',
  },
  3: {
    height: 'h-28',
    avatar: 'h-16 w-16 text-xl',
    ring: 'ring-4 ring-orange-300',
    badge: 'bg-orange-300 text-orange-900',
    crown: 'text-orange-400',
  },
};

const PODIUM_ORDER = [2, 1, 3];

export function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="grid grid-cols-3 items-end gap-2 px-2 pt-6">
      {PODIUM_ORDER.map((rank) => {
        const entry = entries.find((e) => e.rank === rank);
        const style = PODIUM_STYLES[rank];
        if (!entry) return <div key={rank} />;
        return (
          <div key={rank} className="flex flex-col items-center">
            {rank === 1 && <Crown size={22} className={cn('mb-1', style.crown)} />}
            <div className="relative">
              <LeaderAvatar name={entry.displayName} avatarUrl={entry.avatarUrl} size={style.avatar} ring={style.ring} />
              <span className={cn('absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-xs font-extrabold shadow', style.badge)}>
                {rank}
              </span>
            </div>
            <p className="mt-3 w-full truncate text-center text-sm font-bold text-slate-900">{entry.displayName}</p>
            <p className="text-center text-xs font-bold text-emerald-700">{bdt(entry.lifetimeEarnings)}</p>
            <div
              className={cn(
                'mt-2 flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b from-white to-slate-100 pt-3 shadow-inner ring-1 ring-slate-200',
                style.height
              )}
            >
              <span className="text-2xl font-extrabold text-slate-700">#{rank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

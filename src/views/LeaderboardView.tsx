import { useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw, Trophy } from 'lucide-react';
import { LeaderAvatar } from '@/components/LeaderAvatar';
import { LeaderboardPodium } from '@/components/LeaderboardPodium';
import { Spinner } from '@/components/ui';
import { useLanguage } from '@/lib/LanguageContext';
import { bdt } from '@/lib/format';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';
import { cn } from '@/lib/cn';

export function LeaderboardView({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setEntries(await fetchLeaderboard());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const me = entries.find((e) => e.isMe);
  const rest = entries.filter((e) => e.rank > 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95" aria-label={t('ফিরে যান', 'Go back')}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="truncate text-base font-bold text-slate-800">{t('লিডারবোর্ড', 'Leaderboard')}</h1>
      </div>

      <div className="px-4 pb-8 pt-5">
        <section className="flex items-center justify-between rounded-[22px] bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg shadow-emerald-900/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('আপনার র‍্যাংক', 'Your Rank')}</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{me ? `#${me.rank}` : '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('মোট আয়', 'Total Earnings')}</p>
            <p className="mt-1 text-xl font-extrabold">{me ? bdt(me.lifetimeEarnings) : '—'}</p>
          </div>
        </section>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7 border-slate-300 border-t-emerald-600" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl bg-rose-50 p-5 text-center ring-1 ring-rose-200">
            <p className="text-sm font-semibold text-rose-700">{t('লিডারবোর্ড লোড করা যায়নি।', "Couldn't load the leaderboard.")}</p>
            <button onClick={load} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 active:scale-95">
              <RefreshCw size={14} /> {t('আবার চেষ্টা করুন', 'Try again')}
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="mt-8 flex flex-col items-center py-12 text-center">
            <Trophy size={40} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{t('এখনো কোনো র‍্যাংকিং নেই।', 'No rankings yet.')}</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            <LeaderboardPodium entries={entries} />

            {rest.length > 0 && (
              <ul className="mt-8 space-y-2.5">
                {rest.map((e) => (
                  <li
                    key={e.rank}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 shadow-sm',
                      e.isMe ? 'ring-emerald-400 bg-emerald-50/60' : 'ring-slate-200/70'
                    )}
                  >
                    <span className="w-8 shrink-0 text-center text-sm font-extrabold text-slate-500">#{e.rank}</span>
                    <LeaderAvatar name={e.displayName} avatarUrl={e.avatarUrl} size="h-10 w-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-bold text-slate-800">
                        <span className="truncate">{e.displayName}</span>
                        {e.isMe && <span className="badge bg-emerald-100 text-emerald-700">{t('আপনি', 'You')}</span>}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-extrabold text-emerald-700">{bdt(e.lifetimeEarnings)}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

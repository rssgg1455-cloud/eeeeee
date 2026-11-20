import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  lifetimeEarnings: number;
  isMe: boolean;
}

interface LeaderboardRow {
  rank: number | string;
  display_name: string;
  avatar_url: string | null;
  lifetime_earnings: number | string;
  is_me: boolean;
}

export async function fetchRegisteredUserCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_registered_user_count');
  if (error) throw new Error(error.message);
  const count = Number(data);
  if (!Number.isFinite(count)) throw new Error('Unexpected user count response');
  return count;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_leaderboard');
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected leaderboard response');
  return (data as LeaderboardRow[]).map((row) => ({
    rank: Number(row.rank),
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    lifetimeEarnings: Number(row.lifetime_earnings),
    isMe: row.is_me,
  }));
}

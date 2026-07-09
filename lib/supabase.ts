import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export function getSupabaseClient() {
  return supabase;
}

export function subscribeToChannel(
  channelName: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  schema: string,
  table: string,
  filter: string | undefined,
  callback: (payload: any) => void,
) {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as any,
      {
        event,
        schema,
        table,
        filter,
      },
      callback,
    )
    .subscribe();

  return channel;
}

export function unsubscribeChannel(channel: any) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

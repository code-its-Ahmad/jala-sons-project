import { create } from 'zustand';
import { Notification } from '@/types';
import { supabase } from '@/lib/supabase';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
}

let notificationChannel: any = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { notificationsApi } = await import('@/lib/api');
      const data = await notificationsApi.list();
      set({
        notifications: data.data || [],
        unreadCount: (data.data || []).filter((n: Notification) => !n.is_read).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const { notificationsApi } = await import('@/lib/api');
      await notificationsApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      const { notificationsApi } = await import('@/lib/api');
      await notificationsApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  subscribe: (userId) => {
    if (notificationChannel) return;
    const channelName = `notifications:${userId}`;
    notificationChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const newNotif = payload.new as Notification;
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },
      )
      .subscribe();
  },

  unsubscribe: () => {
    if (notificationChannel) {
      supabase.removeChannel(notificationChannel);
      notificationChannel = null;
    }
  },
}));

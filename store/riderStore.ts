import { create } from 'zustand';
import { Rider, Order } from '@/types';

interface RiderState {
  profile: Rider | null;
  activeOrders: Order[];
  isOnline: boolean;
  isLoading: boolean;
  setProfile: (profile: Rider) => void;
  setActiveOrders: (orders: Order[]) => void;
  toggleOnline: () => void;
  setIsOnline: (online: boolean) => void;
}

export const useRiderStore = create<RiderState>((set) => ({
  profile: null,
  activeOrders: [],
  isOnline: false,
  isLoading: false,

  setProfile: (profile) => set({ profile, isOnline: profile.is_online }),

  setActiveOrders: (orders) => set({ activeOrders: orders }),

  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),

  setIsOnline: (online) => set({ isOnline: online }),
}));

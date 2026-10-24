import { create } from 'zustand';

export type NavTab = 'today' | 'habits' | 'vault' | 'league' | 'insights' | 'settings' | 'checkin';

interface AppState {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isCheckInModalOpen: boolean;
  setCheckInModalOpen: (open: boolean) => void;
  isPerfectDayModalOpen: boolean;
  setPerfectDayModalOpen: (open: boolean) => void;
  activeFocusHabitId: string | null;
  setActiveFocusHabitId: (id: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
  isHealthModalOpen: boolean;
  setHealthModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTab: 'today',
  setCurrentTab: (tab) => set({ currentTab: tab }),
  isCheckInModalOpen: false,
  setCheckInModalOpen: (open) => set({ isCheckInModalOpen: open }),
  isPerfectDayModalOpen: false,
  setPerfectDayModalOpen: (open) => set({ isPerfectDayModalOpen: open }),
  activeFocusHabitId: null,
  setActiveFocusHabitId: (id) => set({ activeFocusHabitId: id }),
  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
    }, 3200);
  },
  clearToast: () => set({ toastMessage: null }),
  isHealthModalOpen: false,
  setHealthModalOpen: (open) => set({ isHealthModalOpen: open }),
}));

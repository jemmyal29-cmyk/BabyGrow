/**
 * Child Store — global UI state for monitored child (Zustand)
 * Not server state — React Query owns children/measurements lists.
 */

import { create } from 'zustand';
import type { Gender } from '../types/database';

export interface ActiveChildMeta {
  id: string;
  name: string;
  gender: Gender;
  date_of_birth: string;
}

interface ChildStoreState {
  activeChildId: string | null;
  activeChild: ActiveChildMeta | null;
  setActiveChild: (child: ActiveChildMeta | null) => void;
  setActiveChildId: (id: string | null) => void;
  clearActiveChild: () => void;
}

export const useChildStore = create<ChildStoreState>((set) => ({
  activeChildId: null,
  activeChild: null,

  setActiveChild: (child) =>
    set({
      activeChild: child,
      activeChildId: child?.id ?? null,
    }),

  setActiveChildId: (id) =>
    set((state) => ({
      activeChildId: id,
      activeChild: state.activeChild?.id === id ? state.activeChild : null,
    })),

  clearActiveChild: () => set({ activeChildId: null, activeChild: null }),
}));

export const selectActiveChildId = (s: ChildStoreState) => s.activeChildId;
export const selectActiveChild = (s: ChildStoreState) => s.activeChild;

/**
 * Sync Store — UI state for offline measurement queue + connectivity
 * Written by MeasurementSyncService; read by useSyncStatus / SyncStatusIndicator.
 */

import { create } from 'zustand';

export type SyncVisualStatus = 'synced' | 'syncing' | 'offline';

interface SyncStoreState {
  queueLength: number;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isProcessing: boolean;
  lastUpdatedAt: string | null;
  setQueueLength: (n: number) => void;
  setConnectivity: (params: {
    isConnected: boolean;
    isInternetReachable: boolean | null;
  }) => void;
  setProcessing: (v: boolean) => void;
  publish: (partial: {
    queueLength?: number;
    isConnected?: boolean;
    isInternetReachable?: boolean | null;
    isProcessing?: boolean;
  }) => void;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  queueLength: 0,
  isConnected: true,
  isInternetReachable: true,
  isProcessing: false,
  lastUpdatedAt: null,

  setQueueLength: (queueLength) =>
    set({ queueLength, lastUpdatedAt: new Date().toISOString() }),

  setConnectivity: ({ isConnected, isInternetReachable }) =>
    set({
      isConnected,
      isInternetReachable,
      lastUpdatedAt: new Date().toISOString(),
    }),

  setProcessing: (isProcessing) =>
    set({ isProcessing, lastUpdatedAt: new Date().toISOString() }),

  publish: (partial) =>
    set({
      ...partial,
      lastUpdatedAt: new Date().toISOString(),
    }),
}));

export function deriveSyncVisualStatus(state: {
  queueLength: number;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isProcessing?: boolean;
}): SyncVisualStatus {
  const online =
    state.isConnected === true && state.isInternetReachable !== false;
  if (!online) return 'offline';
  if (state.queueLength > 0 || state.isProcessing) return 'syncing';
  return 'synced';
}

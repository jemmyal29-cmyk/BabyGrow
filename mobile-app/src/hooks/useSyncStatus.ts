/**
 * useSyncStatus — monitors offline measurement queue + NetInfo via syncStore
 */

import { useMemo } from 'react';
import {
  useSyncStore,
  deriveSyncVisualStatus,
  type SyncVisualStatus,
} from '../store/syncStore';
import MeasurementSyncService from '../services/MeasurementSyncService';

export interface SyncStatus {
  status: SyncVisualStatus;
  label: string;
  queueLength: number;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isProcessing: boolean;
  /** Trigger manual drain (e.g. on press) */
  retry: () => Promise<void>;
}

const LABELS: Record<SyncVisualStatus, string> = {
  synced: 'Synced',
  syncing: 'Syncing',
  offline: 'Offline',
};

export function useSyncStatus(): SyncStatus {
  const queueLength = useSyncStore((s) => s.queueLength);
  const isConnected = useSyncStore((s) => s.isConnected);
  const isInternetReachable = useSyncStore((s) => s.isInternetReachable);
  const isProcessing = useSyncStore((s) => s.isProcessing);

  const status = useMemo(
    () =>
      deriveSyncVisualStatus({
        queueLength,
        isConnected,
        isInternetReachable,
        isProcessing,
      }),
    [queueLength, isConnected, isInternetReachable, isProcessing]
  );

  return {
    status,
    label: LABELS[status],
    queueLength,
    isConnected,
    isInternetReachable,
    isProcessing,
    retry: async () => {
      const sync = MeasurementSyncService.getInstance();
      await sync.refreshSyncStore();
      await sync.processQueue();
    },
  };
}

export default useSyncStatus;

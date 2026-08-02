/**
 * CSV export helper — build CSV string + share via expo-file-system/legacy + Sharing
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

function escapeCsv(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function rowsToCsv(
  headers: string[],
  rows: Array<Record<string, unknown>>
): string {
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
  ];
  return lines.join('\n');
}

export async function exportCsvAndShare(params: {
  filename: string;
  headers: string[];
  rows: Array<Record<string, unknown>>;
}): Promise<void> {
  const csv = rowsToCsv(params.headers, params.rows);
  const name = params.filename.endsWith('.csv')
    ? params.filename
    : `${params.filename}.csv`;

  const base =
    FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
  if (!base) {
    throw new Error('File system tidak tersedia di perangkat ini');
  }

  const path = `${base}${name}`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error(
      Platform.OS === 'web'
        ? 'Share tidak didukung di web preview'
        : 'Sharing tidak tersedia di perangkat ini'
    );
  }

  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Export CSV BabyGrow',
    UTI: 'public.comma-separated-values-text',
  });
}

import { getDatabase } from './connection';

export function getSetting(key: string, defaultValue?: string): string | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? defaultValue ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDatabase();
  db.runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

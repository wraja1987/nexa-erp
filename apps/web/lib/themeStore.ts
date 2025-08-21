import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

export type ThemeSnapshot = {
  id: string;
  createdAtIso: string;
  createdBy: string; // user id or email
  tokens: Record<string, string>;
  note?: string;
};

type ThemeStoreData = {
  snapshots: ThemeSnapshot[];
};

const STORE_PATH = join(process.cwd(), 'apps', 'web', '.data', 'theme-snapshots.json');

function ensureStore(): ThemeStoreData {
  if (!existsSync(STORE_PATH)) {
    mkdirSync(dirname(STORE_PATH), { recursive: true });
    const initial: ThemeStoreData = { snapshots: [] };
    writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw) as ThemeStoreData;
  } catch {
    const fallback: ThemeStoreData = { snapshots: [] };
    writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export function getSnapshots(): ThemeSnapshot[] {
  return ensureStore().snapshots;
}

export function addSnapshot(snapshot: ThemeSnapshot): void {
  const data = ensureStore();
  const next = [snapshot, ...data.snapshots].slice(0, 10);
  writeFileSync(STORE_PATH, JSON.stringify({ snapshots: next }, null, 2), 'utf8');
}

export function findSnapshot(id: string): ThemeSnapshot | undefined {
  return ensureStore().snapshots.find(s => s.id === id);
}



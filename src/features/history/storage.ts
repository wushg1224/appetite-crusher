import type { StoredHistory } from "@/types/experience";

export const HISTORY_STORAGE_KEY = "appetite-crusher:history:v1";

export const EMPTY_HISTORY: StoredHistory = {
  version: 1,
  records: [],
};

export function readHistory(): StoredHistory {
  if (typeof window === "undefined") return EMPTY_HISTORY;

  const value = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!value) return EMPTY_HISTORY;

  try {
    const parsed = JSON.parse(value) as StoredHistory;
    return parsed.version === 1 && Array.isArray(parsed.records)
      ? parsed
      : EMPTY_HISTORY;
  } catch {
    return EMPTY_HISTORY;
  }
}

export function writeHistory(history: StoredHistory): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

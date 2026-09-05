import {
  DOSES_MG,
  type ExperienceRecord,
  type StoredHistory,
} from "@/types/experience";

export const HISTORY_STORAGE_KEY = "appetite-crusher:history:v1";
const HISTORY_CHANGE_EVENT = "appetite-crusher:history-change";

export const EMPTY_HISTORY: StoredHistory = {
  version: 1,
  records: [],
};

function isRecord(value: unknown): value is ExperienceRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Partial<ExperienceRecord>;
  const completedAt = typeof record.completedAt === "string"
    ? new Date(record.completedAt)
    : null;

  return (
    typeof record.id === "string"
    && record.id.length > 0
    && typeof record.doseMg === "number"
    && (DOSES_MG as readonly number[]).includes(record.doseMg)
    && (record.site === "abdomen" || record.site === "thigh")
    && typeof record.completedAt === "string"
    && completedAt instanceof Date
    && !Number.isNaN(completedAt.getTime())
    && typeof record.localDate === "string"
    && localDateToDayNumber(record.localDate) !== null
  );
}

function notifyHistoryChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
}

export function parseHistorySnapshot(value: string | null): StoredHistory {
  if (!value) return EMPTY_HISTORY;

  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed !== "object" || parsed === null) return EMPTY_HISTORY;

    const history = parsed as Partial<StoredHistory>;
    return history.version === 1
      && Array.isArray(history.records)
      && history.records.every(isRecord)
      ? { version: 1, records: history.records }
      : EMPTY_HISTORY;
  } catch {
    return EMPTY_HISTORY;
  }
}

export function getHistorySnapshot(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readHistory(): StoredHistory {
  return parseHistorySnapshot(getHistorySnapshot());
}

export function writeHistory(history: StoredHistory): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  notifyHistoryChange();
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  notifyHistoryChange();
}

export function subscribeToHistory(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === HISTORY_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(HISTORY_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(HISTORY_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function localDateToDayNumber(value: string): number | null {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return Math.floor(timestamp / DAY_IN_MS);
}

function dateToLocalDayNumber(date: Date): number {
  return Math.floor(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ) / DAY_IN_MS);
}

export function calculateCurrentStreak(
  records: ExperienceRecord[],
  today = new Date(),
): number {
  const recordedDays = [...new Set(
    records
      .map((record) => localDateToDayNumber(record.localDate))
      .filter((day): day is number => day !== null),
  )].sort((left, right) => right - left);

  if (recordedDays.length === 0) return 0;

  const todayNumber = dateToLocalDayNumber(today);
  const latestDay = recordedDays[0];

  // A streak remains current through the day after the latest check-in.
  if (latestDay > todayNumber || latestDay < todayNumber - 1) return 0;

  let streak = 1;
  for (let index = 1; index < recordedDays.length; index += 1) {
    if (recordedDays[index - 1] - recordedDays[index] !== 1) break;
    streak += 1;
  }

  return streak;
}

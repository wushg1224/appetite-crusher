import type { ExperienceRecord, StoredHistory } from "@/types/experience";

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

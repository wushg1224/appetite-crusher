export const DOSES_MG = [2.5, 5, 7.5, 10, 12.5, 15] as const;

export type DoseMg = (typeof DOSES_MG)[number];
export type InjectionSite = "abdomen" | "thigh";

export interface ExperienceRecord {
  id: string;
  doseMg: DoseMg;
  site: InjectionSite;
  completedAt: string;
  localDate: string;
}

export interface StoredHistory {
  version: 1;
  records: ExperienceRecord[];
}

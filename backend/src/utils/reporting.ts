export enum PromotionStatus {
  PROMOTED = "promoted",
  CONDITIONAL = "conditional",
  NOT_PROMOTED = "not_promoted",
}

export enum ReportTerm {
  TERM1 = "term1",
  TERM2 = "term2",
  TERM3 = "term3",
  TERM4 = "term4",
}

export enum AchievementLevel {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
}

export interface AchievementBand {
  min: number;
  max: number;
  level: AchievementLevel;
  descriptor: string;
}

export const achievementBands: AchievementBand[] = [
  { min: 0, max: 29, level: AchievementLevel.ONE, descriptor: "Not achieved" },
  {
    min: 30,
    max: 39,
    level: AchievementLevel.TWO,
    descriptor: "Elementary achievement",
  },
  {
    min: 40,
    max: 49,
    level: AchievementLevel.THREE,
    descriptor: "Moderate achievement",
  },
  {
    min: 50,
    max: 59,
    level: AchievementLevel.FOUR,
    descriptor: "Adequate achievement",
  },
  {
    min: 60,
    max: 69,
    level: AchievementLevel.FIVE,
    descriptor: "Substantial achievement",
  },
  {
    min: 70,
    max: 79,
    level: AchievementLevel.SIX,
    descriptor: "Meritorious achievement",
  },
  {
    min: 80,
    max: 100,
    level: AchievementLevel.SEVEN,
    descriptor: "Outstanding achievement",
  },
];

export const termLabels: Record<ReportTerm, string> = {
  [ReportTerm.TERM1]: "Term 1",
  [ReportTerm.TERM2]: "Term 2",
  [ReportTerm.TERM3]: "Term 3",
  [ReportTerm.TERM4]: "Term 4",
};

export const clampPercentage = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
};

export const mapPercentageToAchievement = (percentage: number): AchievementLevel => {
  const pct = clampPercentage(percentage);
  const match = achievementBands.find(
    (band) => pct >= band.min && pct <= band.max,
  );
  return match?.level ?? AchievementLevel.ONE;
};

export const getAchievementDescriptor = (
  level?: AchievementLevel | null,
): string => {
  if (!level) {
    return "";
  }
  const band = achievementBands.find((item) => item.level === level);
  return band?.descriptor ?? "";
};

export type TermFilterOption = {
  value: ReportTerm;
  label: string;
};

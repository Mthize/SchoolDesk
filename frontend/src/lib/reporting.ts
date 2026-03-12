import type { ReportTerm } from "@/types";

export const achievementLevels = [
  {
    level: 7,
    range: "80-100%",
    label: "Outstanding achievement",
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  {
    level: 6,
    range: "70-79%",
    label: "Meritorious achievement",
    tone: "bg-green-500/10 text-green-600",
  },
  {
    level: 5,
    range: "60-69%",
    label: "Substantial achievement",
    tone: "bg-teal-500/10 text-teal-600",
  },
  {
    level: 4,
    range: "50-59%",
    label: "Adequate achievement",
    tone: "bg-sky-500/10 text-sky-600",
  },
  {
    level: 3,
    range: "40-49%",
    label: "Moderate achievement",
    tone: "bg-indigo-500/10 text-indigo-600",
  },
  {
    level: 2,
    range: "30-39%",
    label: "Elementary achievement",
    tone: "bg-amber-500/10 text-amber-600",
  },
  {
    level: 1,
    range: "0-29%",
    label: "Not achieved",
    tone: "bg-red-500/10 text-red-600",
  },
];

export const termLabelMap: Record<ReportTerm, string> = {
  term1: "Term 1",
  term2: "Term 2",
  term3: "Term 3",
  term4: "Term 4",
};

export const formatTermLabel = (
  term?: ReportTerm,
  fallback?: string,
): string => {
  if (!term) return fallback ?? "";
  return termLabelMap[term] ?? fallback ?? term;
};

export const buildEmptyStateMessage = (contextLabel?: string) =>
  contextLabel
    ? `No report card has been published for ${contextLabel}.`
    : "Your report cards will appear here once published by your teachers.";

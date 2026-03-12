import { type HydratedDocument } from "mongoose";
import { type User } from "../models/user";
import { type ReportCard } from "../models/reportCard";
import {
  getAchievementDescriptor,
  PromotionStatus,
  ReportTerm,
  termLabels,
} from "../utils/reporting";

export interface SerializedReportCardSubject {
  subjectId?: string;
  name: string;
  code?: string;
  courseworkMark: number | null;
  examMark: number | null;
  finalPercentage: number;
  percentage: number;
  achievementLevel: number | null;
  achievementLabel: string;
  achievementDescriptor: string;
  teacherComment: string;
  assessedBy: { id?: string; name?: string } | null;
}

export interface SerializedReportCard {
  id: string;
  term: ReportTerm;
  termLabel: string;
  promotionStatus: PromotionStatus;
  overallPercentage: number;
  overallAverage: number;
  overallAchievement: number | null;
  overallDescriptor: string;
  generalComment: string;
  classTeacherRemark: string;
  principalRemark: string;
  publishedAt?: Date;
  isFinal: boolean;
  academicYear: { id?: string; name?: string; isCurrent?: boolean } | null;
  class: { id?: string; name?: string } | null;
  student: { id?: string; name?: string } | null;
  issuedBy: { id?: string; name?: string } | null;
  subjects: SerializedReportCardSubject[];
}

export interface ReportCardFiltersPayload {
  terms: { value: ReportTerm; label: string }[];
  academicYears: { id?: string; name?: string; isCurrent?: boolean }[];
}

type PopulatedReportCard = HydratedDocument<ReportCard> & {
  academicYear?: { _id?: string; name?: string; isCurrent?: boolean } | null;
  class?: { _id?: string; name?: string } | null;
  student?: { _id?: string; name?: string } | null;
  issuedBy?: { _id?: string; name?: string } | null;
};

const formatId = (value?: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) {
    return (value as { toString: () => string }).toString();
  }
  return undefined;
};

export const resolveStudentScope = (
  user: User,
  requestedStudentId?: string,
  forcedStudentId?: string,
): string | undefined => {
  if (forcedStudentId) {
    return forcedStudentId;
  }
  if (user.role === "student") {
    return user._id.toString();
  }
  return requestedStudentId;
};

export const filterCardsForTeacherAccess = (
  cards: PopulatedReportCard[],
  teacherId: string,
  teacherClassIds: string[],
): PopulatedReportCard[] => {
  if (!teacherId) return cards;
  return cards.filter((card) => {
    const issuedMatch =
      formatId(card.issuedBy?._id) === teacherId ||
      formatId(card.issuedBy as any) === teacherId;
    const classMatch = teacherClassIds.includes(
      formatId(card.class?._id) ?? formatId(card.class as any) ?? "",
    );
    const subjectMatch = card.subjects.some((subject) => {
      const assessorId =
        formatId((subject.assessedBy as any)?._id) ??
        formatId(subject.assessedBy as any);
      return assessorId === teacherId;
    });
    return issuedMatch || classMatch || subjectMatch;
  });
};

export const filterCardsByTermYear = (
  cards: PopulatedReportCard[],
  term?: ReportTerm,
  academicYearId?: string,
) => {
  if (!term && !academicYearId) {
    return cards;
  }
  return cards.filter((card) => {
    const termMatch = term ? card.term === term : true;
    const academicYearMatch = academicYearId
      ? formatId(card.academicYear?._id) === academicYearId
      : true;
    return termMatch && academicYearMatch;
  });
};

export const buildFilterOptions = (
  cards: PopulatedReportCard[],
): ReportCardFiltersPayload => {
  if (cards.length === 0) {
    return { terms: [], academicYears: [] };
  }

  const termMap = new Map<ReportTerm, string>();
  const academicYearMap = new Map<string, { id?: string; name?: string; isCurrent?: boolean }>();

  cards.forEach((card) => {
    termMap.set(card.term, termLabels[card.term] ?? card.term);
    const academicYearId = formatId(card.academicYear?._id);
    if (academicYearId && !academicYearMap.has(academicYearId)) {
      academicYearMap.set(academicYearId, {
        id: academicYearId,
        name: card.academicYear?.name,
        isCurrent: card.academicYear?.isCurrent,
      });
    }
  });

  const orderedTerms = Object.values(ReportTerm).filter((term) =>
    termMap.has(term),
  );

  const terms = orderedTerms.map((term) => ({
    value: term,
    label: termMap.get(term) ?? term,
  }));

  const academicYears = Array.from(academicYearMap.values()).sort((a, b) => {
    if (a.isCurrent === b.isCurrent) {
      return (b.name ?? "").localeCompare(a.name ?? "");
    }
    return (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0);
  });

  return { terms, academicYears };
};

export const serializeReportCard = (
  card: PopulatedReportCard,
): SerializedReportCard => {
  const academicYear = card.academicYear as any;
  const classInfo = card.class as any;
  const student = card.student as any;
  const issuedBy = card.issuedBy as any;

  return {
    id: card._id.toString(),
    term: card.term,
    termLabel: termLabels[card.term] ?? card.term,
    promotionStatus: card.promotionStatus ?? PromotionStatus.CONDITIONAL,
    overallPercentage: card.overallPercentage ?? 0,
    overallAverage: card.overallPercentage ?? 0,
    overallAchievement: card.overallAchievement ?? null,
    overallDescriptor: getAchievementDescriptor(card.overallAchievement),
    generalComment: card.generalComment || "",
    classTeacherRemark: card.classTeacherRemark || "",
    principalRemark: card.principalRemark || "",
    publishedAt: card.publishedAt,
    isFinal: card.isFinal,
    academicYear: academicYear
      ? {
          id: formatId(academicYear._id),
          name: academicYear.name,
          isCurrent: academicYear.isCurrent,
        }
      : null,
    class: classInfo
      ? {
          id: formatId(classInfo._id),
          name: classInfo.name,
        }
      : null,
    student: student
      ? {
          id: formatId(student._id),
          name: student.name,
        }
      : null,
    issuedBy: issuedBy
      ? {
          id: formatId(issuedBy._id),
          name: issuedBy.name,
        }
      : null,
    subjects: card.subjects.map((subject) => {
      const subjectInfo = subject.subject as any;
      const assessor = subject.assessedBy as any;
      const finalPercentage = subject.percentage ?? 0;

      return {
        subjectId: formatId(subjectInfo?._id) ?? formatId(subject.subject),
        name: subjectInfo?.name ?? "Unknown subject",
        code: subjectInfo?.code,
        courseworkMark:
          typeof subject.courseworkMark === "number"
            ? subject.courseworkMark
            : null,
        examMark:
          typeof subject.examMark === "number" ? subject.examMark : null,
        finalPercentage,
        percentage: finalPercentage,
        achievementLevel: subject.achievementLevel ?? null,
        achievementLabel: getAchievementDescriptor(subject.achievementLevel),
        achievementDescriptor: getAchievementDescriptor(
          subject.achievementLevel,
        ),
        teacherComment: subject.teacherComment ?? "",
        assessedBy: assessor
          ? {
              id: formatId(assessor._id),
              name: assessor.name,
            }
          : null,
      } satisfies SerializedReportCardSubject;
    }),
  } satisfies SerializedReportCard;
};

export const summarizeTeacherClassIds = (classes: { _id: unknown }[]) =>
  classes.map((cls) => formatId(cls._id)).filter((id): id is string => Boolean(id));

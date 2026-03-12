import { type Response } from "express";
import { Types, type FilterQuery } from "mongoose";
import ReportCardModel, { type ReportCard } from "../models/reportCard";
import Class from "../models/class";
import { type AuthRequest } from "../middleware/auth";
import { ReportTerm } from "../utils/reporting";
import {
  buildFilterOptions,
  filterCardsByTermYear,
  filterCardsForTeacherAccess,
  resolveStudentScope,
  serializeReportCard,
  summarizeTeacherClassIds,
  type ReportCardFiltersPayload,
  type SerializedReportCard,
} from "./reportCard.helpers";

const getSingleValue = (value?: string | string[]): string | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const isValidObjectId = (value?: string) =>
  value ? Types.ObjectId.isValid(value) : true;

interface QueryValues {
  studentId?: string;
  academicYearId?: string;
  classId?: string;
  term?: ReportTerm;
  latestOnly?: boolean;
}

type QueryParseResult =
  | { error: string }
  | { values: QueryValues };

const parseQueryParams = (query: Record<string, unknown>): QueryParseResult => {
  const studentId = getSingleValue(query.studentId as string | string[]);
  const academicYearId = getSingleValue(
    query.academicYearId as string | string[],
  );
  const classId = getSingleValue(query.classId as string | string[]);
  const termValue = getSingleValue(query.term as string | string[]);
  const latestValue = getSingleValue(query.latest as string | string[]);

  if (studentId && !isValidObjectId(studentId)) {
    return { error: "Invalid studentId" };
  }
  if (academicYearId && !isValidObjectId(academicYearId)) {
    return { error: "Invalid academicYearId" };
  }
  if (classId && !isValidObjectId(classId)) {
    return { error: "Invalid classId" };
  }

  let term: ReportTerm | undefined;
  if (termValue) {
    if (!Object.values(ReportTerm).includes(termValue as ReportTerm)) {
      return { error: "Invalid term" };
    }
    term = termValue as ReportTerm;
  }

  const latestOnly = Boolean(
    latestValue &&
      ["true", "1", "yes"].includes(latestValue.toLowerCase?.() ?? ""),
  );

  return {
    values: {
      studentId,
      academicYearId,
      classId,
      term,
      latestOnly,
    },
  };
};

interface FetchReportCardArgs {
  user: NonNullable<AuthRequest["user"]>;
  query: QueryValues;
  forcedStudentId?: string;
}

const fetchReportCardsForUser = async ({
  user,
  query,
  forcedStudentId,
}: FetchReportCardArgs): Promise<{
  reportCards: SerializedReportCard[];
  filters: ReportCardFiltersPayload;
}> => {
  const filter: FilterQuery<ReportCard> = {};
  const resolvedStudentId = resolveStudentScope(
    user,
    query.studentId,
    forcedStudentId,
  );

  if (resolvedStudentId) {
    filter.student = resolvedStudentId;
  }

  if (query.classId) {
    filter.class = query.classId;
  }

  let teacherClassIds: string[] = [];

  if (user.role === "teacher") {
    const classes = await Class.find({ classTeacher: user._id }).select("_id");
    teacherClassIds = summarizeTeacherClassIds(classes);

    const teacherVisibility: FilterQuery<ReportCard> = {
      $or: [{ issuedBy: user._id }, { "subjects.assessedBy": user._id }],
    };

    if (teacherClassIds.length > 0) {
      teacherVisibility.$or?.push({ class: { $in: teacherClassIds } });
    }

    filter.$and = [...(filter.$and ?? []), teacherVisibility];
  }

  const cards = await ReportCardModel.find(filter)
    .populate("academicYear", "name fromYear toYear isCurrent")
    .populate("class", "name classTeacher")
    .populate("student", "name role")
    .populate("issuedBy", "name role")
    .populate("subjects.subject", "name code")
    .populate("subjects.assessedBy", "name role")
    .sort({ publishedAt: -1, createdAt: -1 });

  const authorizedCards =
    user.role === "teacher"
      ? filterCardsForTeacherAccess(
          cards,
          user._id.toString(),
          teacherClassIds,
        )
      : cards;

  const filteredCards = filterCardsByTermYear(
    authorizedCards,
    query.term,
    query.academicYearId,
  );

  const latestCards = query.latestOnly
    ? filteredCards.slice(0, 1)
    : filteredCards;

  return {
    reportCards: latestCards.map(serializeReportCard),
    filters: buildFilterOptions(authorizedCards),
  };
};

// @desc    Fetch report cards for the authenticated context
// @route   GET /api/report-cards
// @access  Admin | Teacher | Student
export const getReportCards = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const parsed = parseQueryParams(req.query);

    if ("error" in parsed) {
      return res.status(400).json({ message: parsed.error });
    }

    const payload = await fetchReportCardsForUser({
      user: req.user,
      query: parsed.values,
    });

    return res.json(payload);
  } catch (error) {
    console.error("Failed to fetch report cards", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get the latest report card for the authenticated student
// @route   GET /api/report-cards/latest
// @access  Student
export const getLatestReportCard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const parsed = parseQueryParams({ ...req.query, latest: "true" });

    if ("error" in parsed) {
      return res.status(400).json({ message: parsed.error });
    }

    const payload = await fetchReportCardsForUser({
      user: req.user,
      query: { ...parsed.values, latestOnly: true },
    });

    return res.json({
      reportCard: payload.reportCards[0] ?? null,
      filters: payload.filters,
    });
  } catch (error) {
    console.error("Failed to fetch latest report card", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Fetch report cards for a specific student (admin/teacher)
// @route   GET /api/report-cards/student/:studentId
// @access  Admin | Teacher
export const getStudentReportCards = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { studentId } = req.params;

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    const parsed = parseQueryParams(req.query);

    if ("error" in parsed) {
      return res.status(400).json({ message: parsed.error });
    }

    const payload = await fetchReportCardsForUser({
      user: req.user,
      query: parsed.values,
      forcedStudentId: studentId,
    });

    return res.json(payload);
  } catch (error) {
    console.error("Failed to fetch student report cards", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

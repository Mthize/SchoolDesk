import { describe, expect, it } from "bun:test";
import { Types } from "mongoose";
import {
  buildFilterOptions,
  filterCardsByTermYear,
  filterCardsForTeacherAccess,
  resolveStudentScope,
} from "./reportCard.helpers";
import { ReportTerm } from "../utils/reporting";
import { type User, UserRole } from "../models/user";

const buildMockUser = (role: User["role"], id = new Types.ObjectId()) =>
  ({
    _id: id,
    role,
  }) as unknown as User;

const buildMockCard = (
  overrides: Partial<{
    term: ReportTerm;
    academicYearId: string;
    classId: string;
    issuedById: string;
    assessedById: string;
  }>,
) => {
  const academicYearId = overrides.academicYearId ?? new Types.ObjectId().toString();
  const classId = overrides.classId ?? new Types.ObjectId().toString();
  const issuedById = overrides.issuedById ?? new Types.ObjectId().toString();
  const assessedById = overrides.assessedById ?? new Types.ObjectId().toString();

  return {
    _id: new Types.ObjectId(),
    term: overrides.term ?? ReportTerm.TERM1,
    academicYear: { _id: academicYearId, name: "2024", isCurrent: true },
    class: { _id: classId, name: "Grade 8" },
    issuedBy: { _id: issuedById, name: "Ms Jones" },
    subjects: [
      {
        subject: new Types.ObjectId(),
        assessedBy: { _id: assessedById, name: "Ms Jones" },
        teacherComment: "",
      },
    ],
  } as any;
};

describe("reportCard helpers", () => {
  it("forces students to only scope their own report cards", () => {
    const student = buildMockUser(UserRole.STUDENT);
    const requestedId = new Types.ObjectId().toString();

    const resolved = resolveStudentScope(student, requestedId);
    expect(resolved).toEqual(student._id.toString());
  });

  it("allows staff to request other students when authorized", () => {
    const admin = buildMockUser(UserRole.ADMIN);
    const requestedId = new Types.ObjectId().toString();

    const resolved = resolveStudentScope(admin, requestedId);
    expect(resolved).toEqual(requestedId);
  });

  it("filters cards according to academic year and term selections", () => {
    const cards = [
      buildMockCard({ term: ReportTerm.TERM1, academicYearId: "a" }),
      buildMockCard({ term: ReportTerm.TERM2, academicYearId: "b" }),
    ];

    const filtered = filterCardsByTermYear(cards, ReportTerm.TERM2, "b");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].term).toEqual(ReportTerm.TERM2);
  });

  it("only includes teacher-accessible cards", () => {
    const teacher = buildMockUser(UserRole.TEACHER);
    const allowedClassId = new Types.ObjectId().toString();
    const cards = [
      buildMockCard({ classId: allowedClassId }),
      buildMockCard({ classId: new Types.ObjectId().toString() }),
    ];

    const scoped = filterCardsForTeacherAccess(
      cards,
      teacher._id.toString(),
      [allowedClassId],
    );

    expect(scoped).toHaveLength(1);
    expect(scoped[0].class?._id).toEqual(allowedClassId);
  });

  it("builds filter options for the UI", () => {
    const cards = [
      buildMockCard({ term: ReportTerm.TERM1, academicYearId: "ay1" }),
      buildMockCard({ term: ReportTerm.TERM2, academicYearId: "ay1" }),
    ];

    const filters = buildFilterOptions(cards as any);
    expect(filters.terms.map((term) => term.value)).toEqual([
      ReportTerm.TERM1,
      ReportTerm.TERM2,
    ]);
    expect(filters.academicYears[0]?.id).toEqual("ay1");
  });
});

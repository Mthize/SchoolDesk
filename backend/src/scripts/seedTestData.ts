import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import AcademicYear from "../models/academicYear";
import Subject from "../models/subject";
import ClassModel from "../models/class";
import Timetable from "../models/timetable";
import Exam from "../models/exam";
import { ActivityLog } from "../models/activitieslog";
import ReportCardModel from "../models/reportCard";
import { PromotionStatus, ReportTerm } from "../utils/reporting";
import { User, UserRole } from "../models/user";

type SeedUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teacherSubjectIds?: mongoose.Types.ObjectId[];
  studentClassId?: mongoose.Types.ObjectId;
};

const subjectBlueprints = [
  { name: "Mathematics", code: "MAT10-GP" },
  { name: "English Home Language", code: "ENG10-GP" },
  { name: "IsiZulu FAL", code: "ZUL10-GP" },
  { name: "Life Sciences", code: "LFS10-GP" },
];

const refs = {
  academicYear: null as mongoose.Types.ObjectId | null,
  classId: null as mongoose.Types.ObjectId | null,
  subjects: new Map<string, mongoose.Types.ObjectId>(),
  users: new Map<string, mongoose.Types.ObjectId>(),
};

const credentials: Record<string, { email: string; password: string }[]> = {};

type MongoCaseError = Error & {
  code?: number;
  codeName?: string;
  errmsg?: string;
  errorResponse?: {
    errmsg?: string;
  };
};

const parseDatabaseCaseError = (
  error: unknown,
): { existing: string; requested: string } | null => {
  if (!error || typeof error !== "object") return null;
  const castError = error as MongoCaseError;
  if (castError.codeName !== "DatabaseDifferCase" && castError.code !== 13297) {
    return null;
  }
  const candidates: string[] = [];
  if (castError.errorResponse?.errmsg) candidates.push(castError.errorResponse.errmsg);
  if (castError.errmsg) candidates.push(castError.errmsg);
  if (castError.message) candidates.push(castError.message);
  for (const message of candidates) {
    const match = message.match(
      /already have:\s*\[([^\]]+)]\s*trying to create\s*\[([^\]]+)]/i,
    );
    if (match) {
      return { existing: match[1], requested: match[2] };
    }
  }
  return null;
};

const handleDatabaseCaseMismatch = (error: unknown): boolean => {
  const diff = parseDatabaseCaseError(error);
  if (!diff) return false;
  console.warn(
    `⚠️ MongoDB database "${diff.requested}" already exists as "${diff.existing}" (case-sensitive). Retrying with the existing casing...`,
  );
  process.env.MONGO_DB_NAME = diff.existing;
  console.warn(
    `ℹ️ Update your MONGO_URL or set MONGO_DB_NAME="${diff.existing}" in backend/.env to skip this extra pass.`,
  );
  return true;
};

const ensureAcademicYear = async () => {
  const payload = {
    name: "2025 Gauteng Cycle",
    fromYear: new Date("2025-01-15T08:00:00Z"),
    toYear: new Date("2025-12-05T14:00:00Z"),
    isCurrent: true,
  };

  const year = await AcademicYear.findOneAndUpdate(
    { name: payload.name },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  refs.academicYear = year._id;
  await AcademicYear.updateMany(
    { _id: { $ne: year._id }, isCurrent: true },
    { isCurrent: false },
  );
  console.log(`✅ Academic year "${year.name}" is active.`);
};

const ensureSubjects = async () => {
  for (const blueprint of subjectBlueprints) {
    const subject = await Subject.findOneAndUpdate(
      { code: blueprint.code },
      blueprint,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    refs.subjects.set(blueprint.code, subject._id);
  }
  console.log(`✅ ${refs.subjects.size} core subjects configured.`);
};

const ensureUser = async ({
  name,
  email,
  password,
  role,
  teacherSubjectIds,
  studentClassId,
}: SeedUserInput) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      role,
      teacherSubject: teacherSubjectIds,
      studentClass: studentClassId,
      isActive: true,
    });
  } else {
    user.name = name;
    user.role = role;
    user.isActive = true;
    user.teacherSubject = teacherSubjectIds ?? user.teacherSubject;
    user.studentClass = studentClassId ?? user.studentClass;
    user.password = password; // triggers hashing via pre-save hook
    await user.save();
  }
  refs.users.set(email, user._id);
  if (!credentials[role]) {
    credentials[role] = [];
  }
  if (!credentials[role].some((entry) => entry.email === email)) {
    credentials[role].push({ email, password });
  }
  return user;
};

const ensureClass = async () => {
  if (!refs.academicYear) throw new Error("Academic year missing");
  const classTeacher = refs.users.get("sipho.dlamini@schooldesk.co.za");
  if (!classTeacher) throw new Error("Teacher missing");
  const subjectIds = Array.from(refs.subjects.values());

  const cls = await ClassModel.findOneAndUpdate(
    { name: "Grade 10A", academicYear: refs.academicYear },
    {
      name: "Grade 10A",
      academicYear: refs.academicYear,
      classTeacher,
      subject: subjectIds,
      capacity: 35,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
  refs.classId = cls._id;
  console.log("✅ Class Grade 10A linked to 2025 year.");
  return cls;
};

const ensureTimetable = async () => {
  if (!refs.classId || !refs.academicYear) return;
  const sipho = refs.users.get("sipho.dlamini@schooldesk.co.za");
  const naledi = refs.users.get("naledi.mokoena@schooldesk.co.za");
  if (!sipho || !naledi) return;

  const math = refs.subjects.get("MAT10-GP");
  const english = refs.subjects.get("ENG10-GP");
  const zulu = refs.subjects.get("ZUL10-GP");
  const life = refs.subjects.get("LFS10-GP");
  if (!math || !english || !zulu || !life) return;

  const dayTemplate = [
    { subject: math, teacher: sipho, startTime: "08:00", endTime: "08:45" },
    { subject: english, teacher: naledi, startTime: "08:50", endTime: "09:35" },
    { subject: life, teacher: sipho, startTime: "09:40", endTime: "10:25" },
    { subject: zulu, teacher: naledi, startTime: "10:45", endTime: "11:30" },
    { subject: math, teacher: sipho, startTime: "11:35", endTime: "12:20" },
  ];

  await Timetable.findOneAndDelete({
    class: refs.classId,
    academicYear: refs.academicYear,
  });

  await Timetable.create({
    class: refs.classId,
    academicYear: refs.academicYear,
    schedule: [
      { day: "Monday", periods: dayTemplate },
      { day: "Tuesday", periods: [...dayTemplate].reverse() },
      { day: "Wednesday", periods: dayTemplate },
      { day: "Thursday", periods: [...dayTemplate].reverse() },
      { day: "Friday", periods: dayTemplate },
    ],
  });
  console.log("✅ Weekly timetable stored.");
};

const ensureExam = async () => {
  if (!refs.classId) return;
  const teacherId = refs.users.get("sipho.dlamini@schooldesk.co.za");
  const subjectId = refs.subjects.get("MAT10-GP");
  if (!teacherId || !subjectId) return;

  let exam = await Exam.findOne({
    title: "Term 1 Mathematics Common Test",
    class: refs.classId,
  });

  const questions = [
    {
      questionText: "Solve for x: 2x^2 - 8 = 0",
      type: "MCQ",
      options: ["x = ±2", "x = ±4", "x = 0", "x = 8"],
      correctAnswer: "x = ±2",
      points: 5,
    },
    {
      questionText: "Explain two properties of an isosceles triangle.",
      type: "SHORT_ANSWER",
      options: [],
      correctAnswer: "Two equal sides and two equal base angles",
      points: 5,
    },
  ];

  if (!exam) {
    exam = await Exam.create({
      title: "Term 1 Mathematics Common Test",
      subject: subjectId,
      class: refs.classId,
      teacher: teacherId,
      duration: 60,
      dueDate: new Date("2025-03-14T08:00:00Z"),
      isActive: true,
      questions,
    });
  } else {
    exam.set({
      subject: subjectId,
      teacher: teacherId,
      duration: 60,
      dueDate: new Date("2025-03-14T08:00:00Z"),
      isActive: true,
      questions,
    });
    await exam.save();
  }
  console.log("✅ Mathematics exam ready for Grade 10A.");
};

const ensureReportCard = async () => {
  const studentId = refs.users.get("ayanda.maseko@student.schooldesk.co.za");
  const issuedBy = refs.users.get("thandi.nkosi@schooldesk.co.za");
  if (!refs.academicYear || !refs.classId || !studentId || !issuedBy) return;

  const payload = {
    academicYear: refs.academicYear,
    term: ReportTerm.TERM1,
    student: studentId,
    class: refs.classId,
    subjects: [
      {
        subject: refs.subjects.get("MAT10-GP"),
        termMark: 78,
        maxMark: 100,
        teacherComment: "Consistent work on algebra",
        assessedBy: refs.users.get("sipho.dlamini@schooldesk.co.za"),
      },
      {
        subject: refs.subjects.get("ENG10-GP"),
        termMark: 72,
        maxMark: 100,
        teacherComment: "Great comprehension",
        assessedBy: refs.users.get("naledi.mokoena@schooldesk.co.za"),
      },
      {
        subject: refs.subjects.get("LFS10-GP"),
        termMark: 65,
        maxMark: 100,
        teacherComment: "Shows curiosity",
        assessedBy: refs.users.get("sipho.dlamini@schooldesk.co.za"),
      },
      {
        subject: refs.subjects.get("ZUL10-GP"),
        termMark: 70,
        maxMark: 100,
        teacherComment: "Improved oral work",
        assessedBy: refs.users.get("naledi.mokoena@schooldesk.co.za"),
      },
    ],
    promotionStatus: PromotionStatus.PROMOTED,
    generalComment: "Excellent progress ahead of June exams.",
    issuedBy,
    isFinal: false,
  };

  let reportCard = await ReportCardModel.findOne({
    student: studentId,
    academicYear: refs.academicYear,
    term: ReportTerm.TERM1,
  });

  if (!reportCard) {
    reportCard = new ReportCardModel(payload);
  } else {
    reportCard.set(payload);
  }
  await reportCard.save();
  console.log("✅ Report card published for Ayanda.");
};

const ensureActivityLogs = async () => {
  const adminId = refs.users.get("thandi.nkosi@schooldesk.co.za");
  if (!adminId) return;
  const entries = [
    {
      action: "Seeded Grade 10A timetable",
      details: "Baseline data for verification",
    },
    {
      action: "Seeded Term 1 Mathematics Exam",
      details: "AI-ready question set",
    },
  ];

  for (const entry of entries) {
    await ActivityLog.findOneAndUpdate(
      { user: adminId, action: entry.action },
      { user: adminId, ...entry },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
};

const seed = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined. Update backend/.env and retry.");
  }
  await connectDB();
  await ensureAcademicYear();
  await ensureSubjects();

  await ensureUser({
    name: "Thandi Nkosi",
    email: "thandi.nkosi@schooldesk.co.za",
    password: "Admin@2025",
    role: UserRole.ADMIN,
  });

  const siphoSubjects = ["MAT10-GP", "LFS10-GP"].map((code) => refs.subjects.get(code)!);
  const nalediSubjects = ["ENG10-GP", "ZUL10-GP"].map((code) => refs.subjects.get(code)!);

  await ensureUser({
    name: "Sipho Dlamini",
    email: "sipho.dlamini@schooldesk.co.za",
    password: "Teach@123",
    role: UserRole.TEACHER,
    teacherSubjectIds: siphoSubjects,
  });

  await ensureUser({
    name: "Naledi Mokoena",
    email: "naledi.mokoena@schooldesk.co.za",
    password: "Teach@456",
    role: UserRole.TEACHER,
    teacherSubjectIds: nalediSubjects,
  });

  const cls = await ensureClass();

  await ensureUser({
    name: "Ayanda Maseko",
    email: "ayanda.maseko@student.schooldesk.co.za",
    password: "Learn@123",
    role: UserRole.STUDENT,
    studentClassId: cls._id,
  });

  await ensureUser({
    name: "Lerato Khumalo",
    email: "lerato.khumalo@student.schooldesk.co.za",
    password: "Learn@123",
    role: UserRole.STUDENT,
    studentClassId: cls._id,
  });

  await ClassModel.updateOne(
    { _id: cls._id },
    {
      $set: {
        students: Array.from(refs.users.entries())
          .filter(([email]) => email.endsWith("@student.schooldesk.co.za"))
          .map(([, id]) => id),
      },
    },
  );

  const siphoId = refs.users.get("sipho.dlamini@schooldesk.co.za");
  const nalediId = refs.users.get("naledi.mokoena@schooldesk.co.za");
  if (siphoId) {
    await Subject.updateOne({ code: "MAT10-GP" }, { teacher: [siphoId] });
    await Subject.updateOne({ code: "LFS10-GP" }, { teacher: [siphoId] });
  }
  if (nalediId) {
    await Subject.updateOne({ code: "ENG10-GP" }, { teacher: [nalediId] });
    await Subject.updateOne({ code: "ZUL10-GP" }, { teacher: [nalediId] });
  }

  await ensureTimetable();
  await ensureExam();
  await ensureReportCard();
  await ensureActivityLogs();

  console.log("\nSeed credentials (for local testing):");
  console.table(
    Object.entries(credentials).flatMap(([role, entries]) =>
      entries.map((creds) => ({ role, ...creds })),
    ),
  );
};

const runSeedWithRecovery = async () => {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await seed();
      return;
    } catch (error) {
      const canRetry = attempt < maxAttempts && handleDatabaseCaseMismatch(error);
      if (canRetry) {
        continue;
      }
      console.error("❌ Seed failed", error);
      process.exitCode = 1;
      return;
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    }
  }
};

void runSeedWithRecovery();

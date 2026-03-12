export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ClassRef {
  _id: string;
  name?: string;
}

export interface user {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentClass?: ClassRef | null;
  teacherSubjects?: subject[];
  teacherSubject?: subject[]; // API compatibility
}

export interface academicYear {
  _id: string;
  name: string; // "2024-2025"
  fromYear: Date; // "2024-09-01"
  toYear: Date; // "2025-06-30"
  isCurrent: boolean; // true/false
}

export interface Class extends ClassRef {
  name: string; // e.g., "Grade 10"
  academicYear: academicYear; // Link to "2024-2025"
  classTeacher: user; // The main teacher in charge
  subjects: subject[]; // List of subjects taught in this class
  students: user[]; // List of students enrolled
  capacity: number; // Max students allowed (optional)
}

export interface subject {
  _id: string;
  name: string; // "Mathematics"
  code: string; // "MATH101"
  teacher?: user[]; // Default teacher for this subject
  isActive: boolean; // Indicates if the subject is currently active
}

export interface question {
  _id: string;
  questionText: string;
  type: string;
  options: string[]; // Array of strings e.g. ["A", "B", "C", "D"]
  correctAnswer: string; // Hidden from students in default queries
  points: number;
}

export interface exam {
  _id: string;
  title: string;
  subject: subject;
  class: Class;
  teacher: user;
  duration: number; // in minutes
  questions: question[];
  dueDate: Date;
  isActive: boolean;
}

export interface Submission {
  _id: string;
  score: number;
  exam: exam; // The populated exam with answers
  answers: { questionId: string; answer: string }[];
}

export interface period {
  _id: string;
  subject: { _id: string; name: string; code: string };
  teacher: { _id: string; name: string };
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "08:45"
}

export interface schedule {
  day: string; // "Monday", "Tuesday", etc.
  periods: period[];
}

export type ReportTerm = "term1" | "term2" | "term3" | "term4";

export type PromotionStatus = "promoted" | "conditional" | "not_promoted";

export interface ReportCardMetaRef {
  id?: string;
  name?: string;
  isCurrent?: boolean;
}

export interface ReportCardSubject {
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

export interface ReportCard {
  id: string;
  term: ReportTerm;
  termLabel?: string;
  promotionStatus: PromotionStatus;
  overallPercentage: number;
  overallAverage: number;
  overallAchievement: number | null;
  overallDescriptor: string;
  generalComment: string;
  classTeacherRemark: string;
  principalRemark: string;
  publishedAt?: string;
  isFinal: boolean;
  academicYear: ReportCardMetaRef | null;
  class: ReportCardMetaRef | null;
  student: ReportCardMetaRef | null;
  issuedBy: ReportCardMetaRef | null;
  subjects: ReportCardSubject[];
}

export interface ReportCardFilters {
  terms: { value: ReportTerm; label: string }[];
  academicYears: { id?: string; name?: string; isCurrent?: boolean }[];
}

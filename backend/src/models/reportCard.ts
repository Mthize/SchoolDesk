import mongoose, { Schema, type Document } from "mongoose";
import {
  AchievementLevel,
  PromotionStatus,
  ReportTerm,
  clampPercentage,
  mapPercentageToAchievement,
} from "../utils/reporting";

export interface SubjectPerformance {
  subject: mongoose.Types.ObjectId;
  termMark: number;
  maxMark: number;
  courseworkMark?: number;
  courseworkMax?: number;
  courseworkWeight?: number;
  examMark?: number;
  examMax?: number;
  examWeight?: number;
  percentage?: number;
  achievementLevel?: AchievementLevel;
  teacherComment?: string;
  assessedBy?: mongoose.Types.ObjectId;
}

export interface ReportCard extends Document {
  academicYear: mongoose.Types.ObjectId;
  term: ReportTerm;
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  subjects: SubjectPerformance[];
  overallPercentage?: number;
  overallAchievement?: AchievementLevel;
  promotionStatus: PromotionStatus;
  generalComment?: string;
  classTeacherRemark?: string;
  principalRemark?: string;
  issuedBy: mongoose.Types.ObjectId;
  publishedAt?: Date;
  isFinal: boolean;
}

const subjectPerformanceSchema = new Schema<SubjectPerformance>(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    termMark: { type: Number, min: 0, required: true },
    maxMark: { type: Number, min: 1, required: true },
    courseworkMark: { type: Number, min: 0, max: 100 },
    courseworkMax: { type: Number, min: 0 },
    courseworkWeight: { type: Number, min: 0, max: 1, default: 0.4 },
    examMark: { type: Number, min: 0, max: 100 },
    examMax: { type: Number, min: 0 },
    examWeight: { type: Number, min: 0, max: 1, default: 0.6 },
    percentage: { type: Number, min: 0, max: 100 },
    achievementLevel: {
      type: Number,
      enum: Object.values(AchievementLevel).filter(
        (value) => typeof value === "number",
      ),
    },
    teacherComment: { type: String },
    assessedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false },
);

const reportCardSchema = new Schema<ReportCard>(
  {
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    term: {
      type: String,
      enum: Object.values(ReportTerm),
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    subjects: { type: [subjectPerformanceSchema], default: [] },
    overallPercentage: { type: Number, min: 0, max: 100 },
    overallAchievement: {
      type: Number,
      enum: Object.values(AchievementLevel).filter(
        (value) => typeof value === "number",
      ),
    },
    promotionStatus: {
      type: String,
      enum: Object.values(PromotionStatus),
      required: true,
    },
    generalComment: { type: String },
    classTeacherRemark: { type: String },
    principalRemark: { type: String },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
    isFinal: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reportCardSchema.index(
  { student: 1, academicYear: 1, term: 1 },
  { unique: true },
);

const normalizeMarkToPercentage = (mark?: number, max?: number) => {
  if (typeof mark !== "number") {
    return undefined;
  }
  if (typeof max === "number" && max > 0) {
    return (mark / max) * 100;
  }
  return mark;
};

const computePercentage = (entry: SubjectPerformance) => {
  const courseworkScore = normalizeMarkToPercentage(
    entry.courseworkMark,
    entry.courseworkMax,
  );
  const examScore = normalizeMarkToPercentage(entry.examMark, entry.examMax);
  if (courseworkScore !== undefined || examScore !== undefined) {
    const courseworkWeight = entry.courseworkWeight ?? 0.4;
    const examWeight = entry.examWeight ?? 0.6;
    const totalWeight = courseworkWeight + examWeight || 1;
    const normalizedCourseworkWeight = courseworkWeight / totalWeight;
    const normalizedExamWeight = examWeight / totalWeight;
    const weightedScore =
      (courseworkScore ?? examScore ?? 0) * normalizedCourseworkWeight +
      (examScore ?? courseworkScore ?? 0) * normalizedExamWeight;
    return clampPercentage(weightedScore);
  }
  if (entry.maxMark) {
    return clampPercentage((entry.termMark / entry.maxMark) * 100);
  }
  return clampPercentage(entry.termMark ?? 0);
};

reportCardSchema.pre("save", function (this: ReportCard) {
  if (!this.isModified("subjects")) {
    return;
  }

  this.subjects = this.subjects.map((entry) => {
    const percentage = Math.round(computePercentage(entry) * 100) / 100;
    const achievementLevel = mapPercentageToAchievement(percentage);
    return {
      ...entry,
      percentage,
      achievementLevel,
    };
  });

  if (this.subjects.length > 0) {
    const total = this.subjects.reduce(
      (sum, entry) => sum + (entry.percentage ?? 0),
      0,
    );
    const average = Math.round((total / this.subjects.length) * 100) / 100;
    this.overallPercentage = average;
    this.overallAchievement = mapPercentageToAchievement(average);
  }
});

const ReportCardModel = mongoose.model<ReportCard>(
  "ReportCard",
  reportCardSchema,
);

export default ReportCardModel;

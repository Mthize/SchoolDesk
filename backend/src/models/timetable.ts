import mongoose, { Schema, model, Document } from "mongoose";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
type DayName = (typeof DAYS_OF_WEEK)[number];

export interface TimetablePeriod {
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
}

export interface Timetable extends Document {
  class: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  schedule: {
    day: DayName;
    periods: TimetablePeriod[];
  }[];
}

const periodSchema = new Schema<TimetablePeriod>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const timetableSchema = new Schema<Timetable>(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: DAYS_OF_WEEK,
          required: true,
        },
        periods: {
          type: [periodSchema],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

timetableSchema.index({ class: 1, academicYear: 1 }, { unique: true });

export default model<Timetable>("Timetable", timetableSchema);

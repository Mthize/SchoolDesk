import mongoose, { Schema, model, Document } from "mongoose";

export interface Timetable extends Document {
  class: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  day: string;
  periods: {
    subject: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
  }[];
}

const timetableSchema = new Schema<Timetable>({
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
  day: {
    type: String,
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  periods: [
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
  ],
}, {
  timestamps: true,
});

timetableSchema.index({ class: 1, academicYear: 1, day: 1 }, { unique: true });

export default model<Timetable>("Timetable", timetableSchema);

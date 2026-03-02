import mongoose, { Schema, Document } from "mongoose";


export interface Subject extends Document {
  name: string;
  code: string;
  teacher: mongoose.Types.ObjectId[];
  isActive: boolean;
}

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacher: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<Subject>("Subject", subjectSchema);

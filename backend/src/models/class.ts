import { Schema, model, Document } from "mongoose";

export interface Class extends Document {
  name: string;
  academicYear: mongoose.Types.ObjectId;
  classTeacher: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  capacity: number;
}

const classSchema = new Schema<Class>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  academicYear: {
    type: Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },

  classTeacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  subject: [
    {
     type: Schema.Types.ObjectId,
     ref: "Subject",
   }
  ],
  students: [
    {
     type: Schema.Types.ObjectId,
     ref: "User",
    }
  ],
  capacity: {
    type: Number,
    default: 40,
  }
 },
  {
    timestamps: true,
  }
);


classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export default model<Class>("Class", classSchema);

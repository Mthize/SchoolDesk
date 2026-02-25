import mongoose, { Schema, Document } from "mongoose";


export interface ActivityLog extends Document {
  user: string;
  action: string;
  details?: string;
  createdAt: Date;
}


const activityLogSchema = new Schema(
  {
   user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
   action: { type: String, required: true },
   details: { type: String },
  },
 {
  timestamps: true,
 }
);


export const ActivityLog = mongoose.model<ActivityLog>('ActivityLog', activityLogSchema);

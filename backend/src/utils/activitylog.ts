import { ActivityLog } from "../models/activitieslog";

export const logActivity = async ({
  userId,
  action,
  details,
}: {
  userId: string;
  action: string;
  details?: string;
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.log("Failed to log activity", error);
  }
};

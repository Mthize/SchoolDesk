import { type Request, type Response } from "express";
import { ActivityLog } from "../models/activitieslog";

// @desc Get all activity logs
// @route GET /api/activitylogs
// @access Private Admin
export const getAllActivites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await ActivityLog.countDocument();

    const logs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

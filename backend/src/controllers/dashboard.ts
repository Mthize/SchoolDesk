import { type Request, type Response } from "express";
import User from "../models/user";
import Class from "../models/class";
import Exam from "../models/exam";
import Submission from "../models/submission";
import { ActivityLog } from "../models/activitieslog";


// Helper to get name of the day
const getTodayName = () => new Date().toLocaleDateString("en-US", {weekday: 'long'});

// @desc    Get Dashboard Statistics Role based
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let stats = {} as Record<string, unknown>;
    // Get last 5 activities system wide (Admin) or for the user (Student/Teacher)
    const activityQuery = user.role === "admin" ? {} : { user: user._id };
    const recentActivities = await ActivityLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const recentActivity = recentActivities.map((log) =>
      `${(log.user as any).name}: ${log.action} (${new Date(
        log.createdAt as any,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
    );

    if (user.role === "admin") {
      const [totalStudents, totalTeachers, activeExams] = await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        Exam.countDocuments({ isActive: true }),
      ]);

      stats = {
        totalStudents,
        totalTeachers,
        activeExams,
        avgAttendance: "95.5%",
        recentActivity,
      };
    } else if (user.role === "teacher") {
      const myClassesCount = await Class.countDocuments({ classTeacher: user._id });

      const myExams = await Exam.find({ teacher: user._id }).select({ _id: 1 });
      const myExamsIds = myExams.map((exam) => exam._id);
      const pendingGrading = await Submission.countDocuments({
        exam: { $in: myExamsIds },
        score: 0,
      });

      const today = getTodayName();
      // TODO: replace placeholders with real timetable lookup
      const nextClass = `Next lesson (${today})`;
      const nextClassTime = "09:00";

      stats = {
        myClassesCount,
        pendingGrading,
        nextClass,
        nextClassTime,
        recentActivity,
      };
    } else if (user.role === "student") {
      const nextExam = await Exam.findOne({
        class: user.studentClass,
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });

      const pendingAssignments = await Exam.countDocuments({
        class: user.studentClass,
        isActive: true,
        dueDate: { $gte: new Date() },
      });

      const myAttendance = "97%";

      stats = {
        myAttendance,
        pendingAssignments,
        nextExam: nextExam?.title || "No upcoming exams",
        nextExamDate: nextExam
          ? new Date(nextExam.dueDate).toLocaleDateString()
          : "",
        recentActivity,
      };
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

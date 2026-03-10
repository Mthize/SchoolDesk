import { type Request, type Response } from "express";
import User from "../models/user";
import Class from "../models/class";
import Exam from "../models/exam";
import Submission from "../models/submission";
import ActivityLog from "../models/activitylog";
import Timetable from "../models/timetable";


// Helper to get name of the day
const getTodayName = () => new Date().toLocaleDateString("en-US", {weekday: 'long'});

// @desc    Get Dashboard Statistics Role based
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let stats = {};
    // Get last 5 activities system wide (Admin) or for the user (Student/Teacher)
    const activityQuery = user.role === 'damin' ? {} : { user: user._id };
    const recentActivities = await Activitylog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const formattedActivities = recentActivities.map((log => 
      `${(log.user as any).name}: ${log.action} (${new Date(log.createdAt as 
       any).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})})`
    ));

    if (user.role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const isActiceExams = await Exam.countDocuments({ isActive: true });


      // Mack Attendance 
      const avgAttendance = "95.5%";

      stats = {
        totalStudents,
        totalTeachers,
        activeExam,
        avgAttendance,
        recentActivities: formattedActivity,
      };
    } else if (user.role === 'teacher') {
      // 1. Count classes assigned to the teacher
      const myClassesCount = await Class.countDocuments({ classTeacher: user._id });

      // 2. Pending Grading: Submissions for exams that are not yet marked as completed
      const myExams = await Exam.find({ teacher: user._id }).select({'_id'});
      const myExamsIds = myExams.map(exam => exam._id);
      const pendingGrades = await Submission.find({ exam: { $in: myExamsIds}, score: 0 });


      // 3. Next Class
      // Find the timetable where is the teacher is teacher today
      const today = getTodayName();
      // TODO: Complex aggregation 
      // This is a placeholder for the logice to find the specific period based on the current time
      const nextClass = "Mathematics - Grade 10";
      const nextClassTime = "09:00";

      stats = {
        myClassesCount,
        pendingGrades,
        nextClass,
        nextClassTime,
        recantActivity: formattedActivity,
      };
    } else if (user.role === 'student') {
      // 1. Assignments/Exams Due
      const nextExam = await Exam.findOne({
        class: user.studentClass,
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });

      const pendingAssignments = await Exam.countDocuments({
        class: user.studentClass,
        isActive: true,
        dueDate: { $gte: new Date() },
      });

      // 2. Attendance *Mockup*
      const myAttendance = '97%';

      stats = {
        myAttendance,
        pendingAssignments,
        nextExam: nextExam?.title || "No upcoming exams",
        nextExamDate: nextExam ? new Date(nextExam.dueDate).toLocaleDateString() : "",
        recantActivity: formattedActivity,
      };
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

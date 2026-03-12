import express from "express";
import {
  triggerExamGeneration,
  getExams,
  submitExam,
  getExamById,
  toggleExamStatus,
  getExamResult,
  deleteExam,
} from "../controllers/exam";
import { protect, authorize } from "../middleware/auth";

const examRouter = express.Router();

examRouter.post(
  "/generate",
  protect,
  authorize(["teacher", "admin"]),
  triggerExamGeneration,
);

examRouter.get(
  "/",
  protect,
  authorize(["student", "teacher", "admin"]),
  getExams,
);

examRouter.get(
  "/:id",
  protect,
  authorize(["student", "teacher", "admin"]),
  getExamById,
);

// Student Router
examRouter.post(
  "/:id/submit",
  protect,
  authorize(["student", "admin"]),
  submitExam,
);

// Teacher - Admin Router
examRouter.patch(
  "/:id/status",
  protect,
  authorize(["teacher", "admin"]),
  toggleExamStatus,
);

examRouter.get(
  "/:id/result",
  protect,
  authorize(["student", "teacher", "admin"]),
  getExamResult,
);

examRouter.delete(
  "/:id",
  protect,
  authorize(["teacher", "admin"]),
  deleteExam,
);

export default examRouter;

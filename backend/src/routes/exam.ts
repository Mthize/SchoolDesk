import express from "express";
import { 
  triggerExamGeneration, 
  getExams, 
  submitExam, 
  getExamsById, 
  toggleExamStatus
} from "../controllers/exam";
import { protect, authorize } from "../middleware/auth";


const examRouter = express.Router();


examRouter.post(
  "/generate", 
  protect, 
  authorize(["admin"]), 
  triggerExamGeneration
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
);

examRouter.post(
  "/:id", 
  protect, 
  authorize(["student", "admin", "teacher"]),
);

export default examRouter;

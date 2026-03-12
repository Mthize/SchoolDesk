import express from "express";
import {
  getLatestReportCard,
  getReportCards,
  getStudentReportCards,
} from "../controllers/reportCard";
import { authorize, protect } from "../middleware/auth";

const reportCardRouter = express.Router();

reportCardRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  getReportCards,
);

reportCardRouter.get(
  "/latest",
  protect,
  authorize(["student"]),
  getLatestReportCard,
);

reportCardRouter.get(
  "/student/:studentId",
  protect,
  authorize(["admin", "teacher"]),
  getStudentReportCards,
);

export default reportCardRouter;

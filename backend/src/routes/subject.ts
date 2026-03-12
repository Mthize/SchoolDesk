import express from "express";
import { authorize, protect } from "../middleware/auth";
import {
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/subject";

const subjectRouter = express.Router();

subjectRouter
  .route("/")
  .post(protect, authorize(["admin"]), createSubject)
  .get(protect, authorize(["admin", "teacher"]), getAllSubjects);

subjectRouter
  .route("/:id")
  .put(protect, authorize(["admin"]), updateSubject)
  .delete(protect, authorize(["admin"]), deleteSubject);

subjectRouter.post("/create", protect, authorize(["admin"]), createSubject);
subjectRouter.patch("/update/:id", protect, authorize(["admin"]), updateSubject);
subjectRouter.delete("/delete/:id", protect, authorize(["admin"]), deleteSubject);

export default subjectRouter;

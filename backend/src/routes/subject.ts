import exprees from "express";
import { authorize, protect } from "../middleware/auth";
import { createSubject } from "../controllers/subject";


const subjectRouter = exprees.Router();

subjectRouter
  .route("/create")
  .post(protect, authorize(["admin"]), createSubject)

subjectRouter
  .route("/create")
  .post(protect, authorize(["admin"]), createSubject)

export default subjectRouter

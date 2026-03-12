import express from "express";
import { createClass, deleteClass, getAllClasses, updateClass } from "../controllers/class";
import { authorize, protect } from "../middleware/auth";


const classRouter = express.Router();

classRouter.get("/", protect, authorize(["admin", "teacher"]), getAllClasses);
classRouter.post("/create", protect, authorize(["admin"]), createClass);
classRouter
  .route("/update/:id")
  .put(protect, authorize(["admin"]), updateClass)
  .patch(protect, authorize(["admin"]), updateClass);
classRouter.delete("/delete/:id", protect, authorize(["admin"]), deleteClass);


export default classRouter;

import express from "express";
import { createClass, deleteClass, getAllClasses, updateClass } from "../controllers/class.ts";
import { authorize, protect } from "../middleware/auth";


const classRouter = express.Router();

classRouter.patch("/", protect, authorize(["admin"]), getAllClasses);
classRouter.post("/create", protect, authorize(["admin"]), createClass);
classRouter.patch("/update/:id", protect, authorize(["admin"]), updateClass);
classRouter.delete("/delete/:id", protect, authorize(["admin"]), deleteClass);


export default classRouter;

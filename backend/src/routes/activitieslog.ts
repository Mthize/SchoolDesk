import express from "express";
import { protect, authorize } from "../middleware/auth";
import { getAllActivites } from "../controllers/activitieslog";

// TODO: Implement all activies
const LogsRouter = express.Router();

LogsRouter.get("/", protect, authorize(["admin", "teacher"]), getAllActivites);

export default LogsRouter;

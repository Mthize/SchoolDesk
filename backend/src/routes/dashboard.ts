import express from "express";
import { getDashboardStats } from "../controllers/dashboard";
import { protect } from "../middleware/auth";

const dashboardRouter = express.Router();

// Get Stats (Role is determined by token)
dashboardRouter.get("/stats", protect, getDashboardStats);

// Get AI Insights
// dashboardRouter.post("/insights", protect, getDashboardInsights);


export default dashboardRouter;

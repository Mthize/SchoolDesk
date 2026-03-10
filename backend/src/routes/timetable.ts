import express from 'express';
import { generateTimetable, getTimetable } from '../controllers/timetable';
import { protect, authorize } from '../middleware/auth';


const timeRouter = express.Router();


// Generate: Admin only (costs - resources)
timeRouter.post("/generate", protect, authorize(["admin"]), generateTimetable);

// View: Everyone (Students can see their timetable)
timeRouter.get("/:classId", protect, getTimetable);


export default timeRouter;

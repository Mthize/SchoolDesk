// simple server
import cookieParser from "cookie-parser";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import userRoutes from "./routes/user";
import LogsRouters from "./routes/activitieslog";
import academicYearRouter from "./routes/academicYear";
import classRouter from "./routes/class";
import subjectRouter from "./routes/subject";
import { serve } from "inngest/express";
import { inngest } from "./inngest";
import { generateExam, generateTimeTable } from "./inngest/functions";
import examRouter from "./routes/exam";
import timeRouter from "./routes/timetable";
import dashboardRouter from "./routes/dashboard";
import reportCardRouter from "./routes/reportCard";

// load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || "5000";
const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

// add a security middlewares / headers
app.use(helmet()); // Security middlewares to set various HTTP headers for app security

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-endcoded bodies
app.use(cookieParser()); // Middleware to parse Cookies

// log http requests to the console
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// cross origin resource sharing (OORS) middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// user routes
app.use("/api/users", userRoutes);
app.use("/api/activities", LogsRouters);
app.use("/api/academic-year", academicYearRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/timetables", timeRouter);
app.use("/api/exam", examRouter);
app.use("/api/exams", examRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/report-cards", reportCardRouter);
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [generateTimeTable, generateExam],
  }),
);

// global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: "ERROR", message: err.message });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

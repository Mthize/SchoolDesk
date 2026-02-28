import express from "express";
import { 
  createAcademicYear, 
  getCurrentAcademicYear, 
  updateAcademicYear,
  deleteAcademicYear,
  getAllAcademicYears
} from "../controllers/academicYear";
import { protect, authorize } from "../middleware/auth";


const academicYearRoutes = express.Router();

academicYearRoutes
  .route("/") 
  .get(protect, authorize(["admin"]), getAllAcademicYears);

academicYearRoutes
  .route("/create") 
  .post(protect, authorize(["admin"]), createAcademicYear);

academicYearRoutes
  .route("/current") 
  .get(getCurrentAcademicYear);

academicYearRoutes
  .route("/updata/:id") 
  .patch(updateAcademicYear);

academicYearRoutes
  .route("/delete/:id") 
  .delete(protect, authorize(["admin"]), deleteAcademicYear);

export default academicYearRoutes;

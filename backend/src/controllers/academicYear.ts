import { type Request, type Response } from "express";
import { Types } from "mongoose";
import AcademicYear from "../models/academicYear";
import { logActivity } from "../utils/activitylog";

// @desc   Create a new academic year
// @route  POST /api/academicYears/create
// @access Private Admin
export const createAcademicYear = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, fromYear, toYear, isCurrent } = req.body;

    const existingicYear = await AcademicYear.findOne({ fromYear, toYear });
    if (existingicYear) {
      res.status(400).json({ message: "Academic year already exists" });
      return;
    }
    // If isCurrent is true set all other academic year to false
    if (isCurrent) {
      await AcademicYear.updateMany(
        { _id: { $ne: null } },
        { isCurrent: false }
      )
    }

    const academicYear = await AcademicYear.create({
      name,
      fromYear,
      toYear,
      isCurrent: isCurrent || false,
    });
    await logActivity({
      userId: (req as any).user._id, 
      action: `Created academic year ${name}`,
    });
    res.status(201).json(academicYear);    
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}


// @desc   Get the current active academic Year
// @route  Get /api/academicYear/current
// @access Public pr Private
export const getCurrentAcademicYear = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    if (!currentYear) {
      res.status(404).json({ message: "No current academic year found" });
      return;
    } else {
      res.status(200).json(currentYear);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}


// @desc   Update academic year
// @route  PUT /api/academicYears/_id
// @access Private Admin
export const updateAcademicYear = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
  const {isCurrent} = req.body;
    if (isCurrent) {
      await AcademicYear.updateMany(
        { _id: { $ne: req.params.id as unknown as Types.ObjectId } },
        { isCurrent: false }
      );
    }

    const updatedYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedYear) {
      res.status(404).json({ message: "Academic year not found" });
    }

    await logActivity({
      userId: (req as any).user._id,
      action: `Updated academic year ${updatedYear?.name}`,
    });
    res.status(200).json(updatedYear);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Get all academic years (Paginated & Searchable)
// @route  GET /api/academicYears
// @access Public pr Private
export const getAllAcademicYears = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Seacrh Query By Name
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [total, years] = await Promise.all([
      updateAcademicYear.countDocuments(query),
      AcademicYear.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      years,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// @desc   Delete academic year
// @route  DELETE /api/academicYears/:id
// @access Private Admin
export const deleteAcademicYear = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) {
      res.status(404).json({ message: "Academic year not found" });
      return;
    }
    if (year.isCurrent) {
      res.status(400).json({ message: "Cannot delete current academic year" });
      return;
    }
    await year.deleteOne();
    
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted academic year ${year.name}`,
    });
    res.status(200).json({ message: "Academic year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

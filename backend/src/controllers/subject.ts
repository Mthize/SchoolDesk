import { type Request, type Response } from "express";
import { logActivity } from "../utils/activitylog";
import Subject from "../models/subject";

// @desc   Create a new Subject
// @route  POST /api/subjects
// access  Privatr/Admin
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, teacher, isActive } = req.body;

    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
      return res.status(400).json({ message: "Subject code already exists" });
    }
    const newSubject = await Subject.create({
      name,
      code,
      isActive,
      teacher: Array.isArray(teacher) ? teacher : [],
    });

    if (newSubject) {
      const userId = (req as any).user?.id;
      if (userId) {
        await logActivity({
          userId,
          action: `Create subject: ${newSubject.name}`,
        });
      }
      res.status(201).json(newSubject);
    }
  } catch (error) {
    console.error("createSubject failed:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Get all subjects
// @route  Get /api/subjects
// @access  Privatr
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    // Parse the query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Search query (Search by Name or Code)
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Execute Query (Query & Find)
    const [total, subjects] = await Promise.all([
      Subject.countDocuments(query),
      Subject
        .find(query)
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Return Data
    res.status(200).json({
      subjects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllSubjects failed:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Updata a subject
// @route  PUT /api/subjects/:id
// access  Privatr/Admin
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, teacher, isActive } = req.body;

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: req.params.id },
      {
        name,
        code,
        isActive,
        teacher: Array.isArray(teacher) ? teacher : [],
      },
      { new: true, runValidators: true },
    );
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Update subject: ${updatedSubject.name}`,
    });
    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    console.error("updateSubject failed:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc     Delete Subject
// @route    DELETE /api/subject/:id
// @access   Private/Admin
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const deleteSubject = await Subject.findOneAndDelete({ _id: req.params.id });
    if (!deleteSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    const userId = (req as any).user.id;
    await logActivity({
      userId,
      action: `Delete subject: ${deleteSubject.name}`,
    });
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("deleteSubject failed:", error);
    
  }
};

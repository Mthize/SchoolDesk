import { type Request, type Response } from "express";
import Class from "../models/class";
import { logActivity } from "../utils/activitylog";


// @desc   Create a new class
// @route  POST /api/classes
// @access Private
export const createClass = async ( req: Request, res: Response ) => {
  try {
    const { name, academicYear, classTeacher, capacity } = req.body;

    const existingClass = await Class.findOne({ name, academicYear });
    if (existingClass) {
      return res.status(400).json({ message: "Class with this name already exists for the specified academic year" });
    }

    const newClass = await Class.create({
      name,
      academicYear,
      classTeacher,
      capacity,
    });
    
    await logActivity({ 
      userId: (req as any).user?.id, 
      action: `Created new class: ${newClass.name}` 
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Get All classes
// @route  PUT /api/classes/:id
// @access  Private
export const getAllClasses = async ( req: Request, res: Response ) => {
  try {
    // Parse Query Parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Search Query 
    const query: any = [];
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Execute Query (Count & Find)
    const [total, classes] = await Promise.all([
      Class.countDocuments(query),
      Class.find(query)
        .populate("academicYear", "name")
        .populate("classTeacher", "name email")
        .sort({ createAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Return Data
    res.json({
      classes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Update a class
// @route  PUT /api/classes/:id
// @access Private
export const updateClass = async ( req: Request, res: Response ) => {
  try {
    const classId = req.params.id;
    const { name, academicYear } = req.body;

    const existingClass = await Class.findOne({  
      _id: { $ne: classId } 
    });
    if (!existingClass) {
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedClass) {
        return res.status(404).json({ message: "Class not found" })
      }
      await logActivity({
        userId: (req as any).user?.id,
        action: `Updated class: ${classId}`,
      });
      
      res.json(updatedClass);
    } else {
      res.status(400).json({ message: "Class with this name already exists for the specified academic year" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc   Delete Class
// @route  DELETE /api/classes/:id
// @access Private/Admin
export const deleteClass = async ( req: Request, res: Response ) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    const userId = (req as any).user.id;
    await logActivity({
      userId, 
      action: `Deleted class: ${deleteClass?.name}`});
    if (!deleteClass) {
      return res.status(404).json({ message: "Class not found" })
    }
    res.json({ message: "Class was removed" })
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

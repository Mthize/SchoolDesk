import { type Request, type Response } from "express";
import { User } from "../models/user";
import { generateToken } from "../utils/generateToken";
import { logActivity } from "../utils/activitylog";
import { type AuthRequest } from "../types/auth";

// @desc Register a new user
// @route POST /api/users/register
// @access Private (Only admin & teacher)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentClass,
      teacherSubject,
      isActive,
    } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      studentClass,
      teacherSubject,
      isActive,
    });

    if (newUser) {
      if ((req as any).user) {
        await logActivity({
          userId: (req as any).user.id,
          action: "Registered User",
          details: `Registered user ${newUser.name}`,
        });
      }
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        studentClass: newUser.studentClass,
        teacherSubject: newUser.teacherSubject,
        message: "User created successfully",
      });
    } else {
      res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // check if user exist and password match
    if (user && (await user.matchPassword(password))) {
      // generate token
      generateToken(user.id.toString(), res);
      res.json(user); 
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// @desc Update user (Adimn)
// @route PUT /api/users/:id
// @access Private Admin
export const updateUser = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isActive = req.body.isActive || user.isActive;
      user.studentClass = req.body.studentClass || user.studentClass;
      user.teacherSubject = req.body.teacherSubject || user.teacherSubject;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      if ((req as any).user) {    
        await logActivity({
          userId: (req as any).user._id.toString(),
          action: "Updated User",
          details: `Updated user with email:  ${updatedUser.name}`,
        });
      }
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        studentClass: updatedUser.studentClass,
        teacherSubject: updatedUser.teacherSubject,
        message: "User updated successfully",
      });
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc  Get all users (With Pagination & Filtering)
// @route GET /api/users
// @access Private
export const getAllUsers = async ( req: Request, res: Response ): Promise<void> => {
  try {
    // 1. Parse query params safety
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = parseInt(req.query.role as string);
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build Filter object
    const filter:  any = {};

    if (role && role !== "all" && role !== "") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: email, $options: "i" } },
      ];
    }

      // Fetch users with pagination & filtering
      const [total, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
          .select("-password")
          .populate("studentClass", "_id name select")

          .populate("teacherSubject", "_id name code")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ]);

      // Send Response
      res.json({
      pagintation: {      
        users,
        page,
        pages: Math.ceil(total / limit),
        total,
       }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error })
  }
};


// @desc Delete user
// @route DELETE /api/users/:id
// @access Private Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      if ((req as any).user) {    
        await logActivity({
          userId: (req as any).user._id.toString(),
          action: "Deleted User",
          details: `Deleted user with email:  ${user.name}`,
        });
      }
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}


// @desc  Get user profile (via cookie)
// @route GET /api/users/profile
// @access Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      res.json({
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        }
      });
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
     res.status(500).json({ message: "Server Error", error });
  }
  
}


// @desc  Logout user / delete cookie
// @route POST /api/users/logout
// @access Private
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    })
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

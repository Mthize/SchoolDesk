import { type Request, type Response } from "express";
import User from "../models/user";
import { generateToken } from "../utils/generateToken";

// @desc Register a new user
// @route POST /api/users/register
// @access Private (Only admin & teacher)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, email, password, role, studentClass, teacherSubject, isActive } = req.body;

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
    })

    if (newUser) {
      res.status(201).json({
         _id: newUser._id,
         name: newUser.name,
         email: newUser.email,
         role: newUser.role,
         isActive: newUser.isActive,
         studentClass: newUser.studentClass,
         teacherSubject: newUser.teacherSubject,
        message: "User created successfully",
      })
    } else {
      res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}


// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
export const login = async (req: Request, res: Response): Promise<void> => {
 
  try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });

    // check if user exist and password match
    if (user && await user.matchPassword(password)) {
       // generate token
       generateToken(user.id.toString(), res);
       res.json(user)
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
    
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
}

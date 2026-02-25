import express from "express";
import { 
  register, 
  login, 
  updateUser, 
  deleteUser, 
  logoutUser,
  getUserProfile, 
  getAllUsers,
} from "../controllers/user";
import { authorize, protect } from "../middleware/auth";


const userRoutes = express.Router();

// Protect the access to the user token

userRoutes.get("/",protect, authorize(["admin", "teacher"]), getAllUsers);

userRoutes.post(
  "/register",
  protect,
  authorize(["admin", "teacher"]), 
  register
);
userRoutes.post("/login", login);
userRoutes.post("/logout", logoutUser);
userRoutes.get("/profile", protect, getUserProfile);


userRoutes.put(
  "/update/:id",
  protect,
  authorize(["admin", "teacher"]), 
  updateUser
);

userRoutes.delete(
  "/delete/:id",
  protect,
  authorize(["admin", "teacher"]), 
  deleteUser
);


export default userRoutes;

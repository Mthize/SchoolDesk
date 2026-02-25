import express from "express";
import { register, login } from "../controllers/user";
import { authorize, protect } from "../middleware/auth";


const userRoutes = express.Router();

// Protect the access to the user token

userRoutes.post("/register",
  protect,
  authorize
    ([
      "admin", 
      "teacher"
    ]), 
  register);
userRoutes.post("/login", login);

export default userRoutes;

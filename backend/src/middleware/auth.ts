import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, type userRoles } from "../models/user";

export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthResponse extends Response {
  user?: User;
}

// Protected routes middleware
export const protect = async (
  req: AuthRequest,
  res: AuthResponse,
  next: NextFunction
) => {
  let token

  // check for token in cookie
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = (await User.findById(decoded.userid).select("-password")) as User;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Not authorized token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized token" });
  }
}

export const authorize = (roles: userRoles[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  }
}

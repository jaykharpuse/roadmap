import { Request, Response, NextFunction } from "express-serve-static-core";
import Errorhandler from "../util/Errorhandler.util";
import jwt from "jsonwebtoken";
import { JwtDecodedUser } from "../types/jwtDecodedUser";
import usermodel, { User } from "../models/usermodel";
export interface reqwithuser extends Request {
  user?: User;
}

const isAuthenticated = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.token;
  
  if (!token) {
    // Fallback to Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // Remove "Bearer " prefix
    }
  }
  
  if (!token) {
    return next(new Errorhandler(400, "please login to continue"));
  }
  
  try {
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtDecodedUser;
    const user = await usermodel.findById(decodedUser.id);
    if (!user) {
      return next(new Errorhandler(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (error: any) {
    return next(new Errorhandler(401, "Invalid or expired token"));
  }
};



export const isverified = (req: reqwithuser, res: Response, next: NextFunction) => {
  if (req.user?.isVerified === false) {
    return next(new Errorhandler(400, "Please verify your account first"));
  }
  next();
};




const authorization = (roles: string[]) => {
  return (req: reqwithuser, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.Role)) {
      return next(new Errorhandler(403, "access denied: insufficient permissions "));
    }
    next();
  };
};
export { isAuthenticated, authorization };

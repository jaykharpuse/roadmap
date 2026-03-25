import { Response } from "express";
import { User } from "../models/usermodel";
const sendtoken = (
  res: Response,
  token: string,
  statuscode: number,
  user: User
) => {
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    sameSite: "lax" as const,  // Changed from "none" to "lax" for development
    secure: false,  // Set to false for localhost development
  };
  res
    .cookie("token", token, options)
    .status(statuscode)
    .json({
      success: true,
      user,
      token,
    });
};
export default sendtoken;

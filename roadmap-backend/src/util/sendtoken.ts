import { Response } from "express";
import { User } from "../models/usermodel";
const sendtoken = (
  res: Response,
  token: string,
  statuscode: number,
  user: User
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    secure: isProduction,
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

import { NextFunction, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel from "../models/usermodel";
import Errorhandler from "../util/Errorhandler.util";
import sendtoken from "../util/sendtoken";
import { reqwithuser } from "../middleware/auth.middleware";

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Invalid Google access token");
  return res.json() as Promise<GoogleUserInfo>;
}

export const googleSignIn = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const { access_token } = req.body;
    if (!access_token) {
      return next(new Errorhandler(400, "Google access token is required"));
    }

    let profile: GoogleUserInfo;
    try {
      profile = await fetchGoogleUserInfo(access_token);
    } catch {
      return next(new Errorhandler(401, "Invalid Google token. Please try again."));
    }

    if (!profile.email) {
      return next(new Errorhandler(400, "Could not retrieve email from Google"));
    }

    const { sub: googleId, email, name, picture } = profile;

    // Look up by googleId first (returning Google user)
    let user = await usermodel.findOne({ googleId });

    if (!user) {
      // Look up by email — auto-link existing account
      user = await usermodel.findOne({ email });

      if (user) {
        user.googleId = googleId;
        user.authProvider = user.password ? "both" : "google";
        if (!user.isVerified) user.isVerified = true;
        if (picture && !user.profileUrl) user.profileUrl = picture;
        await user.save();
      } else {
        // Create new Google-only account
        user = new usermodel({
          username: name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google",
          profileUrl: picture || "",
          isVerified: true,
          verifyCode: "GOOGLE_AUTH",
          verifyCodeExpiry: new Date(Date.now() + 3600000),
        });
        await user.save();
      }
    }

    const token = user.generateToken();
    sendtoken(res, token, 200, user);
  }
);

export const linkGoogleAccount = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    const { access_token } = req.body;
    const userId = req.user?._id;

    if (!access_token) {
      return next(new Errorhandler(400, "Google access token is required"));
    }

    let profile: GoogleUserInfo;
    try {
      profile = await fetchGoogleUserInfo(access_token);
    } catch {
      return next(new Errorhandler(401, "Invalid Google token. Please try again."));
    }

    const { sub: googleId, picture } = profile;

    // Guard: another user already owns this Google ID
    const existing = await usermodel.findOne({ googleId });
    if (existing && existing._id.toString() !== userId?.toString()) {
      return next(
        new Errorhandler(400, "This Google account is already linked to another user")
      );
    }

    const user = await usermodel.findById(userId);
    if (!user) return next(new Errorhandler(404, "User not found"));

    if (user.googleId === googleId) {
      return next(new Errorhandler(400, "This Google account is already linked to your profile"));
    }

    user.googleId = googleId;
    user.authProvider = "both";
    if (picture && !user.profileUrl) user.profileUrl = picture;
    await user.save();

    const safeUser = await usermodel
      .findById(userId)
      .select("-password -verifyCode -verifyCodeExpiry");

    res.status(200).json({
      success: true,
      message: "Google account linked successfully",
      user: safeUser,
    });
  }
);

export const unlinkGoogleAccount = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    const user = await usermodel.findById(userId);
    if (!user) return next(new Errorhandler(404, "User not found"));

    if (!user.googleId) {
      return next(new Errorhandler(400, "No Google account is linked to your profile"));
    }

    // Ensure user has a password so they can still sign in
    if (!user.password) {
      return next(
        new Errorhandler(
          400,
          "Please set a password before unlinking Google to keep account access"
        )
      );
    }

    user.googleId = undefined;
    user.authProvider = "local";
    await user.save();

    const safeUser = await usermodel
      .findById(userId)
      .select("-password -verifyCode -verifyCodeExpiry");

    res.status(200).json({
      success: true,
      message: "Google account unlinked successfully",
      user: safeUser,
    });
  }
);

export const setPasswordForGoogleUser = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { password } = req.body;

    if (!password || password.length < 5) {
      return next(new Errorhandler(400, "Password must be at least 5 characters"));
    }

    const user = await usermodel.findById(userId);
    if (!user) return next(new Errorhandler(404, "User not found"));

    if (user.password) {
      return next(
        new Errorhandler(400, "Account already has a password. Use reset password to change it.")
      );
    }

    user.password = password;
    user.authProvider = "both";
    await user.save();

    res.status(200).json({ success: true, message: "Password set successfully" });
  }
);

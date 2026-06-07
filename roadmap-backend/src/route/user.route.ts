import { Router } from "express";
import {
  forgotPassword,
  getMyProfile,
  updateMyProfile,
  Login,
  Logout,
  registerUser,
  Resetpassword,
  verifyuser,
  contactSupport,
} from "../controller/user.controller";
import {
  googleSignIn,
  linkGoogleAccount,
  unlinkGoogleAccount,
  setPasswordForGoogleUser,
} from "../controller/googleAuth.controller";
import upload from "../middleware/multer.middleware";
import { isAuthenticated } from "../middleware/auth.middleware";

const userRouter = Router();
userRouter.post("/register", upload.single("profileUrl"), registerUser);
userRouter.post("/verify-code", verifyuser);
userRouter.post("/sign-in", Login);
userRouter.post("/logout", Logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.put("/reset-password/:token", Resetpassword);
userRouter.get("/me", isAuthenticated, getMyProfile);
userRouter.put("/me", isAuthenticated, upload.single("profileUrl"), updateMyProfile);
userRouter.post("/contact", contactSupport);

// Google OAuth
userRouter.post("/auth/google", googleSignIn);
userRouter.post("/auth/google/link", isAuthenticated, linkGoogleAccount);
userRouter.post("/auth/google/unlink", isAuthenticated, unlinkGoogleAccount);
userRouter.post("/auth/google/set-password", isAuthenticated, setPasswordForGoogleUser);

export default userRouter;

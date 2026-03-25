import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./route/user.route";
import RoadmapRouter from "./route/roadmap.route";
import { ErrorhandlerMiddleware } from "./util/Errorhandler.util";
import userProgressRoutes from './route/userProgress.routes';
import analyticsRoutes from './route/analyticsRoutes';
import bookmarkRoutes  from "./route/bookmarkRoutes";
import resourceBookmarkRoutes from "./route/resourceBookmarkRoutes";
import recentlyViewedRoutes from './route/recentlyViewedRoutes';
import notificationRoutes from "./route/notificationRoute";
import resourceRoutes from './route/resourceRoutes';

import reviewRoutes from './route/reviewRoutes';
import resourceReviewRoutes from './route/resourceReviewRoutes';
import roadmapnodeRoutes from "./route/roadmapnodeRoute";
import contentSubmissionRoutes from "./route/contentSubmissionRoutes";





dotenv.config();
ConnectDatabase();

export const userSocketMap = new Map<string, string>();

const staticAllowedOrigins = [
  "https://roadmap-website-frontend-5xdx.vercel.app",
  "https://roadmap-website-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

const isOriginAllowed = (origin?: string) => {
  if (!origin) return true; // allow non-browser tools (curl/postman/server-to-server)

  if (staticAllowedOrigins.includes(origin)) return true;

  // Allow any localhost Vite port (5173, 5174, 5175, ...)
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;

  return false;
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

const app = express();
const server = http.createServer(app); 


export const io = new SocketIOServer(server, {
  cors: corsOptions,
});


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

   socket.on("registerUser", (userId: string) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });


  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


app.use(
  cors(corsOptions)
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true})); 


app.use("/user", userRouter);
app.use("/roadmap", RoadmapRouter);
app.use("/api/progress", userProgressRoutes); 
app.use("/api/analytics", analyticsRoutes); 
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/resource-bookmarks", resourceBookmarkRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/resource-reviews", resourceReviewRoutes);
app.use("/api/roadmapnode", roadmapnodeRoutes); 
app.use("/api/submissions", contentSubmissionRoutes);     

app.use(ErrorhandlerMiddleware);


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});

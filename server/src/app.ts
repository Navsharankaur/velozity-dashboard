import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes.js";
import { authenticate, AuthRequest } from "./middleware/auth.middleware.js";
import projectRoutes from "./projects/projects.routes.js";
import taskRoutes from "./tasks/tasks.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/me", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Velozity API is running",
  });
});

export default app;
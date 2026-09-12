import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
} from "./tasks.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  getTasks
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  createTask
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  updateTask
);

export default router;
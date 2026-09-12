import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function getTasks(req: AuthRequest, res: Response) {
  const user = req.user!;

  const tasks = await prisma.task.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : user.role === "DEVELOPER"
          ? { assigneeId: user.userId }
          : { project: { createdById: user.userId } },

    include: {
      project: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    success: true,
    tasks,
  });
}

export async function createTask(req: AuthRequest, res: Response) {
  const {
    title,
    description,
    projectId,
    assigneeId,
    priority,
    dueDate,
  } = req.body;

  if (!title || !projectId) {
    return res.status(400).json({
      success: false,
      message: "Title and projectId are required",
    });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  if (
    req.user!.role === "PROJECT_MANAGER" &&
    project.createdById !== req.user!.userId
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot manage this project",
    });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  return res.status(201).json({
    success: true,
    task,
  });
}

export async function updateTask(req: AuthRequest, res: Response) {
  const taskId = String(req.params.id);

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: task.projectId,
    },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  if (
    req.user!.role === "DEVELOPER" &&
    task.assigneeId !== req.user!.userId
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this task",
    });
  }

  if (
    req.user!.role === "PROJECT_MANAGER" &&
    project.createdById !== req.user!.userId
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot modify this task",
    });
  }

  const updated = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: req.body,
  });
return res.json({
  success: true,
  task: updated,
});
}

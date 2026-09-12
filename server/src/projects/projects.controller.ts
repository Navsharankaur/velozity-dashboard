import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function getProjects(req: AuthRequest, res: Response) {
  const projects = await prisma.project.findMany({
    where: req.user!.role === "ADMIN"
      ? {}
      : { createdById: req.user!.userId },
    include: { client: true, tasks: true },
  });

  res.json({ success: true, projects });
}

export async function createProject(req: AuthRequest, res: Response) {
  const { name, description, clientId } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Project name is required",
    });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      clientId,
      createdById: req.user!.userId,
    },
  });

  res.status(201).json({ success: true, project });
}
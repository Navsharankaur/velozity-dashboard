import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role, Priority, TaskStatus, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@velozity.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@velozity.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.upsert({
    where: { email: "pm1@velozity.com" },
    update: {},
    create: {
      name: "Project Manager One",
      email: "pm1@velozity.com",
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: "pm2@velozity.com" },
    update: {},
    create: {
      name: "Project Manager Two",
      email: "pm2@velozity.com",
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const developers = [];

  for (let i = 1; i <= 4; i++) {
    developers.push(
      await prisma.user.upsert({
        where: { email: `dev${i}@velozity.com` },
        update: {},
        create: {
          name: `Developer ${i}`,
          email: `dev${i}@velozity.com`,
          passwordHash,
          role: Role.DEVELOPER,
        },
      })
    );
  }

  const client1 = await prisma.client.create({
    data: {
      name: "Acme Technologies",
      email: "contact@acme.com",
      company: "Acme Technologies",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Nova Systems",
      email: "contact@nova.com",
      company: "Nova Systems",
    },
  });

  const project1 = await prisma.project.create({
    data: {
      name: "E-Commerce Platform",
      description: "Build a modern e-commerce platform.",
      createdById: pm1.id,
      clientId: client1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Analytics Dashboard",
      description: "Real-time business analytics dashboard.",
      createdById: pm1.id,
      clientId: client2.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Mobile Application",
      description: "Cross-platform mobile application.",
      createdById: pm2.id,
      clientId: client1.id,
    },
  });

  const projects = [project1, project2, project3];

  for (let p = 0; p < projects.length; p++) {
    for (let i = 1; i <= 5; i++) {
      const overdue = p === 0 && i <= 2;

      await prisma.task.create({
        data: {
          title: `Task ${i} - ${projects[p].name}`,
          description: `Development task ${i}`,
          projectId: projects[p].id,
          assigneeId: developers[(p * 2 + i - 1) % developers.length].id,
          status: i === 3 ? TaskStatus.IN_PROGRESS : TaskStatus.TODO,
          priority:
            i === 1 ? Priority.HIGH : i === 2 ? Priority.MEDIUM : Priority.LOW,
          dueDate: overdue
            ? new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  await prisma.activityLog.create({
    data: {
      type: ActivityType.PROJECT_CREATED,
      message: "E-Commerce Platform project created",
      projectId: project1.id,
      actorId: pm1.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      type: ActivityType.PROJECT_CREATED,
      message: "Analytics Dashboard project created",
      projectId: project2.id,
      actorId: pm1.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: "Dashboard seed data has been created",
    },
  });

  console.log("Seed completed successfully.");
  console.log("Users:");
  console.log("admin@velozity.com");
  console.log("pm1@velozity.com");
  console.log("pm2@velozity.com");
  console.log("dev1@velozity.com ... dev4@velozity.com");
  console.log("Password: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
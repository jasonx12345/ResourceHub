import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const r = Router();

const createZ = z.object({
  title: z.string().min(1),
  link: z.string().url(),
  courseCode: z.string().min(3)
});

// Create a resource (auth required)
r.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = createZ.parse(req.body);
    const userId = (req as any).user.sub as string;

    // ensure course exists (create if missing)
    let course = await prisma.course.findUnique({ where: { code: body.courseCode } });
    if (!course) {
      course = await prisma.course.create({
        data: { code: body.courseCode, name: body.courseCode }
      });
    }

    const row = await prisma.resource.create({
      data: {
        title: body.title,
        link: body.link,
        userId,
        courseId: course.id
      }
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

// List resources (public) — optional filter by course code
r.get("/", async (req, res, next) => {
  try {
    const code = typeof req.query.course === "string" ? req.query.course : "";
    const where = code ? { course: { code } } : {};

    const rows = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        user: { select: { email: true } }
      }
    });

    res.json(rows);
  } catch (e) {
    next(e);
  }
});

export default r;

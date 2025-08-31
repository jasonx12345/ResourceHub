import { Router } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const r = Router();



const credZ = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});


r.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = credZ.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const pwHash = await bcrypt.hash(password, 10);
    const u = await prisma.user.create({ data: { email, pwHash } });
    res.status(201).json({ id: u.id, email: u.email });
  } catch (e) {
    next(e);
  }
});

r.post("/login", async (req, res, next) => {
  try {
    const { email, password } = credZ.parse(req.body);
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u || !(await bcrypt.compare(password, u.pwHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { sub: u.id, email: u.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

export default r;

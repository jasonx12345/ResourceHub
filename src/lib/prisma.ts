import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // log: ["query", "info", "warn", "error"], // uncomment if you want verbose logs
});

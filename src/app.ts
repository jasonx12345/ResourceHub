import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth";
import resourceRoutes from "./routes/resources";

export const app = express();

// Basic hardening + JSON parsing + CORS
app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/auth", authRoutes);
app.use("/resources", resourceRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Error handler

app.use((
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (err?.name === "ZodError") {
    const messages = (err.issues || []).map(
      (i: any) => `${(i.path || []).join(".") || "field"}: ${i.message}`
    );
    return res.status(400).json({
      error: "Invalid input",
      messages,           // <- human-readable reasons
      details: err.issues // <- structured info (optional)
    });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});


import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import publicRouter from "./routes/public.js";

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(currentDir, "../public")));
app.use(cors({ origin: [/^https?:\/\/localhost(:\d+)?$/, /nexaai\.co\.uk$/], credentials: true }));
app.use(express.json());
app.use("/api/public", publicRouter);
// Catch-all: for any non-API request, serve the SPA index.html
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.resolve(currentDir, "../public/index.html"));
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => console.log());

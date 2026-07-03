import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { authenticate, authorize } from "./middleware/auth.js";
import { login } from "./controllers/authController.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./controllers/userController.js";
import {
  getSuratList,
  createSurat,
  updateStatusSurat,
  deleteSurat,
  getSuratById,
} from "./controllers/suratController.js";
import {
  createDisposisi,
  getTugasStaff,
  selesaikanDisposisi,
  getDisposisiBySurat,
} from "./controllers/disposisiController.js";
import { getDashboardStats } from "./controllers/dashboardController.js";
import { exportLaporanPDF } from "./controllers/laporanController.js";

const app = new Hono();

// CORS - izinkan semua origin (ubah ke domain spesifik di production)
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/", (c) => c.json({ status: "ok", message: "Surat Digital API" }));

// Public
app.post("/api/auth/login", login);

// Protected
app.use("/api/*", authenticate);

// Users (admin only)
app.get("/api/users", authorize("admin"), getUsers);
app.post("/api/users", authorize("admin"), createUser);
app.put("/api/users/:id", authorize("admin"), updateUser);
app.delete("/api/users/:id", authorize("admin"), deleteUser);

// Surat
app.get("/api/surat", getSuratList);
app.get("/api/surat/:id", getSuratById);
app.post("/api/surat", authorize("staff", "admin"), createSurat);
app.put(
  "/api/surat/:id/status",
  authorize("staff", "admin"),
  updateStatusSurat,
);
app.delete("/api/surat/:id", authorize("admin"), deleteSurat);

// Disposisi
app.post("/api/disposisi", authorize("pimpinan", "admin"), createDisposisi);
app.get("/api/disposisi/tugas", authorize("staff"), getTugasStaff);
app.get("/api/disposisi/surat/:suratId", getDisposisiBySurat);
app.put("/api/disposisi/:id/selesai", authorize("staff"), selesaikanDisposisi);

// Dashboard
app.get("/api/dashboard", getDashboardStats);

// Laporan PDF
app.get(
  "/api/laporan/pdf",
  authorize("admin", "pimpinan", "staff"),
  exportLaporanPDF,
);

const port = parseInt(process.env.PORT) || 5000;
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);

export default app;

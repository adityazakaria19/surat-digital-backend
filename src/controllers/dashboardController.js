import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardStats = async (c) => {
  try {
    const user = c.get("user");
    let stats = {};
    if (user.role === "admin") {
      const [totalSurat, draft, disposition, process, completed] = await Promise.all([
        prisma.surat.count(),
        prisma.surat.count({ where: { status: "draft" } }),
        prisma.surat.count({ where: { status: "disposition" } }),
        prisma.surat.count({ where: { status: "process" } }),
        prisma.surat.count({ where: { status: "completed" } }),
      ]);
      stats = { totalSurat, draft, disposition, process, completed };
    } else if (user.role === "pimpinan") {
      const [totalDisposisi, selesai] = await Promise.all([
        prisma.disposisi.count({ where: { dariUserId: user.id } }),
        prisma.disposisi.count({ where: { dariUserId: user.id, status: "completed" } }),
      ]);
      stats = { totalDisposisi, selesai };
    } else if (user.role === "staff") {
      const [tugasBelum, tugasSelesai] = await Promise.all([
        prisma.disposisi.count({ where: { kepadaUserId: user.id, status: "pending" } }),
        prisma.disposisi.count({ where: { kepadaUserId: user.id, status: "completed" } }),
      ]);
      stats = { tugasBelum, tugasSelesai };
    }
    return c.json(stats);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Server error" }, 500);
  }
};

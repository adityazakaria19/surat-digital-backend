import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findFirst({
    where: { email: "admin@example.com" },
  });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        nama: "Admin Utama",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
      },
    });
    console.log("Admin user created: admin@example.com / admin123");
  } else {
    console.log("Admin already exists");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

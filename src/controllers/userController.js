import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getUsers = async (c) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nama: true, email: true, role: true, createdAt: true },
    });
    return c.json(users);
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

export const createUser = async (c) => {
  try {
    const { nama, email, password, role } = await c.req.json();
    const hashed = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { nama, email, password: hashed, role },
    });
    return c.json({ id: user.id, nama: user.nama, email: user.email, role: user.role }, 201);
  } catch (err) {
    if (err.code === "P2002") {
      return c.json({ message: "Email sudah terdaftar" }, 400);
    }
    return c.json({ message: "Server error" }, 500);
  }
};

export const updateUser = async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { nama, email, role, password } = await c.req.json();
    const data = { nama, email, role };
    if (password) data.password = bcrypt.hashSync(password, 10);
    const user = await prisma.user.update({ where: { id }, data });
    return c.json({ id: user.id, nama: user.nama, email: user.email, role: user.role });
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

export const deleteUser = async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    await prisma.user.delete({ where: { id } });
    return c.json({ message: "User deleted" });
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

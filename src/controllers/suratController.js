import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import multiparty from "multiparty";

const prisma = new PrismaClient();

export const getSuratList = async (c) => {
  try {
    const user = c.get("user");
    const { search, status, jenis, startDate, endDate } = c.req.query();
    const where = {};
    if (user.role === "staff") where.userId = user.id;
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;
    if (search) {
      where.OR = [
        { nomorSurat: { contains: search, mode: "insensitive" } },
        { perihal: { contains: search, mode: "insensitive" } },
        { pengirimTujuan: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const surat = await prisma.surat.findMany({
      where,
      include: {
        user: { select: { nama: true } },
        disposisi: {
          include: {
            kepadaUser: { select: { nama: true } },
            dariUser: { select: { nama: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return c.json(surat);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Server error" }, 500);
  }
};

export const getSuratById = async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        user: true,
        disposisi: { include: { kepadaUser: true, dariUser: true } },
      },
    });
    if (!surat) return c.json({ message: "Surat not found" }, 404);
    return c.json(surat);
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

export const createSurat = async (c) => {
  try {
    const user = c.get("user");
    const form = new multiparty.Form();
    const data = await new Promise((resolve, reject) => {
      form.parse(c.req.raw, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const file = data.files.file?.[0];
    let fileUrl = null;
    if (file) {
      const upload = await uploadToCloudinary(file.path);
      fileUrl = upload.secure_url;
      fs.unlinkSync(file.path);
    }
    const surat = await prisma.surat.create({
      data: {
        nomorSurat: data.fields.nomorSurat[0],
        jenis: data.fields.jenis[0],
        tanggalSurat: new Date(data.fields.tanggalSurat[0]),
        pengirimTujuan: data.fields.pengirimTujuan[0],
        perihal: data.fields.perihal[0],
        fileUrl,
        userId: user.id,
        status: "draft",
      },
    });
    return c.json(surat, 201);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Server error" }, 500);
  }
};

export const updateStatusSurat = async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { status } = await c.req.json();
    const surat = await prisma.surat.update({ where: { id }, data: { status } });
    return c.json(surat);
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

export const deleteSurat = async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    await prisma.surat.delete({ where: { id } });
    return c.json({ message: "Surat deleted" });
  } catch (err) {
    return c.json({ message: "Server error" }, 500);
  }
};

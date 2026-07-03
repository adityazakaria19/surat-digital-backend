import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ============================================
// FUNGSI LOGIN (sudah ada, sedikit di-optimasi)
// ============================================
export const login = async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validasi input kosong
    if (!email || !password) {
      return c.json({ message: "Email dan password wajib diisi" }, 400);
    }

    // Cari user di database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ message: "Email atau password salah" }, 401);
    }

    // Cek password (menggunakan async compare agar tidak blocking)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ message: "Email atau password salah" }, 401);
    }

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Kirim response sukses
    return c.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    // Tangani error jika JSON tidak valid
    if (err instanceof SyntaxError) {
      return c.json(
        { message: "Format JSON tidak valid. Pastikan Content-Type: application/json" },
        400
      );
    }

    return c.json({ message: "Terjadi kesalahan pada server" }, 500);
  }
};

// ============================================
// FUNGSI VERIFY (TAMBAHAN BARU)
// ============================================
export const verify = async (c) => {
  try {
    // Ambil data user yang sudah ditaruh oleh middleware authenticate
    // Data ini berasal dari hasil decode JWT (id, email, role)
    const decodedUser = c.get("user");

    if (!decodedUser) {
      return c.json({ message: "Unauthorized: Token tidak valid" }, 401);
    }

    // (Opsional) Ambil data lengkap dari database berdasarkan ID
    // Ini berguna jika ingin mengembalikan field 'nama' atau data terbaru
    const fullUser = await prisma.user.findUnique({
      where: { id: decodedUser.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        // tambahkan field lain jika diperlukan, misal: avatar, no_telp, dll
      },
    });

    if (!fullUser) {
      return c.json({ message: "User tidak ditemukan" }, 404);
    }

    // Kirim response sukses dengan pesan "Authorized"
    return c.json(
      {
        message: "Authorized",
        user: fullUser,
      },
      200
    );
  } catch (err) {
    console.error("Verify error:", err);
    return c.json({ message: "Terjadi kesalahan pada server" }, 500);
  }
};
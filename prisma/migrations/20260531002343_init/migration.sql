-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'staff', 'pimpinan');

-- CreateEnum
CREATE TYPE "JenisSurat" AS ENUM ('masuk', 'keluar');

-- CreateEnum
CREATE TYPE "StatusSurat" AS ENUM ('draft', 'disposition', 'process', 'completed');

-- CreateEnum
CREATE TYPE "StatusDisposisi" AS ENUM ('pending', 'completed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat" (
    "id" SERIAL NOT NULL,
    "nomor_surat" TEXT NOT NULL,
    "jenis" "JenisSurat" NOT NULL,
    "tanggal_surat" TIMESTAMP(3) NOT NULL,
    "pengirim_tujuan" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "file_url" TEXT,
    "status" "StatusSurat" NOT NULL DEFAULT 'draft',
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposisi" (
    "id" SERIAL NOT NULL,
    "surat_id" INTEGER NOT NULL,
    "dari_user_id" INTEGER NOT NULL,
    "kepada_user_id" INTEGER NOT NULL,
    "instruksi" TEXT NOT NULL,
    "batas_waktu" TIMESTAMP(3) NOT NULL,
    "status" "StatusDisposisi" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disposisi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "surat" ADD CONSTRAINT "surat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_surat_id_fkey" FOREIGN KEY ("surat_id") REFERENCES "surat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_dari_user_id_fkey" FOREIGN KEY ("dari_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_kepada_user_id_fkey" FOREIGN KEY ("kepada_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

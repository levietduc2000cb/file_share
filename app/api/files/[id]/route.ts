import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {getFirstFileByIdAndUserId, deleteFile} from "@/lib/repositories/fileRepository";
import { unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });

  const { id } = await params;
  const file = await getFirstFileByIdAndUserId(Number(id), user.id);
  if (!file) return NextResponse.json({ message: "Không tìm thấy file." }, { status: 404 });

  await deleteFile(file.id);
  try { await unlink(path.join(process.cwd(), "uploads", file.filePath)); } catch {}

  return NextResponse.json({ message: "Đã xoá file." });
}

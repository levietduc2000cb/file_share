import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {createFile} from "@/lib/repositories/fileRepository";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Không có file." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "File tối đa 50MB." }, { status: 400 });
  }

  const ext = path.extname(file.name).replace(/[^.a-zA-Z0-9]/g, "");
  const storedName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, storedName), buffer);

  const saved = await createFile({
      file_name: file.name,
      file_path: storedName,
      file_size: file.size,
      user_id: user.id,
      mime_type: file.type
    });

  return NextResponse.json({ message: "Upload thành công.", file: saved });
}

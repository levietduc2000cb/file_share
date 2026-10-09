import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFirstFileByIdAndUserId } from "@/lib/repositories/fileRepository";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Kiểm tra đăng nhập
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Chưa đăng nhập." },
        { status: 401 }
      );
    }

    // 2. Kiểm tra ID
    const { id } = await params;
    const fileId = Number(id);

    if (!Number.isSafeInteger(fileId) || fileId <= 0) {
      return NextResponse.json(
        { message: "ID file không hợp lệ." },
        { status: 400 }
      );
    }

    // 3. Lấy thông tin file từ database
    const file = await getFirstFileByIdAndUserId(
      fileId,
      user.id
    );

    if (!file) {
      return NextResponse.json(
        { message: "Không tìm thấy file hoặc không có quyền truy cập." },
        { status: 404 }
      );
    }

    // 4. Kiểm tra đường dẫn file
    if (
      typeof file.filePath !== "string" ||
      !file.filePath ||
      file.filePath !== path.basename(file.filePath) ||
      file.filePath === "." ||
      file.filePath === ".."
    ) {
      console.error("Đường dẫn file không hợp lệ:", file);

      return NextResponse.json(
        { message: "Thông tin đường dẫn file không hợp lệ." },
        { status: 500 }
      );
    }

    // 5. Xác định đường dẫn file vật lý
    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.filePath
    );

    // 6. Đọc file
    let data: Buffer;

    try {
      data = await readFile(filePath);
    } catch (error) {
      console.error("Lỗi đọc file:", error);

      const code = (error as NodeJS.ErrnoException).code;

      if (code === "ENOENT") {
        return NextResponse.json(
          { message: "File vật lý không tồn tại." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Không thể đọc file." },
        { status: 500 }
      );
    }

    // 7. Trả file về client
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type":
          file.mimeType || "application/octet-stream",

        "Content-Disposition":
          `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,

        "Content-Length": data.length.toString(),

        "X-Content-Type-Options": "nosniff",

        "Cache-Control": "private, no-store",
      },
    });

  } catch (error) {
    console.error("Download file error:", error);

    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi tải file." },
      { status: 500 }
    );
  }
}
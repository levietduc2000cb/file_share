import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/repositories/userRepository";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { message: "Vui lòng nhập đủ thông tin, mật khẩu tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    const existed = await findUserByEmail(email);
    if (existed) {
      return NextResponse.json({ message: "Email đã tồn tại." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await createUser({ name, email: email.toLowerCase().trim(), password: hashed });

    const token = await createToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ message: "Đăng ký thành công." });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ message: "Có lỗi xảy ra." }, { status: 500 });
  }
}

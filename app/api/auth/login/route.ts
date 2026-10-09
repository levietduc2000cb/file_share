import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/repositories/userRepository";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Vui lòng nhập email và mật khẩu." }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
    }

    const token = await createToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ message: "Đăng nhập thành công." });
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

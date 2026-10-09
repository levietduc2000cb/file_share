import { cookies } from "next/headers";
import { jwtVerify, SignJWT, errors} from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export async function createToken(user: AuthUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("Không có token");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      console.log("Token đã hết hạn");
    } else if (error instanceof errors.JWSSignatureVerificationFailed) {
      console.log("Sai chữ ký hoặc token đã bị sửa");
    } else if (error instanceof errors.JWTInvalid) {
      console.log("JWT không hợp lệ");
    } else {
      console.log("Lỗi JWT khác:", error);
    }

    return null;
  }
}

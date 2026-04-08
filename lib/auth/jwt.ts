import { JWTPayload, jwtVerify } from "jose";
import { config } from "@/lib/config";

interface DecodedToken extends JWTPayload {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export async function verifyAccessToken(token: string) {
  try {
    const key = new TextEncoder().encode(config.authSecret);
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as DecodedToken;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

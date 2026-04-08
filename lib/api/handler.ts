import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export type AuthenticatedHandler = (
  req: Request,
  context: { params: Promise<Record<string, string | string[]>> },
  user: { id: string; email: string; name: string | null }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request, context: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized: Missing or invalid token" },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      const decoded = await verifyAccessToken(token);

      if (!decoded) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or expired token" },
          { status: 401 }
        );
      }

      // Pass control to the handler with the decoded user
      return await handler(req, context, decoded.user);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

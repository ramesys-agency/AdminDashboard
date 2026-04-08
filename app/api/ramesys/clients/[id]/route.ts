import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { getClientById } from "@/lib/client";

export const GET = withAuth(async (req, context) => {
  const { id } = await context.params;
  const client = await getClientById(id);
  
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  
  return NextResponse.json(client);
});

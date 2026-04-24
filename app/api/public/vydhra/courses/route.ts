import { NextResponse } from "next/server";
import { getCourses } from "@/lib/course";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("q") || undefined;

    const result = await getCourses({ page, limit, search });
    
    // Return just the data array for easier consumption by the frontend if needed, 
    // or keep the structure. Let's keep the structure but ensure details are included.
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

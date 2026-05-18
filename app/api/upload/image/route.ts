import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { cloudinary } from "@/lib/cloudinary";

export const POST = withAuth(async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size must be under 5 MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "vydhra/courses",
    resource_type: "image",
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  });

  return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
});

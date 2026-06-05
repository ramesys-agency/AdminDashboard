import {
  BusinessType,
  BatchStatus,
} from "@prisma/client";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { coursesData } from "./data/courses";

async function main() {
  console.log("🌱 Checking database for existing data...");

  // 1. Leave if any Business, AdminUser or Course is already present
  const businessCount = await prisma.business.count();
  const adminCount = await prisma.adminUser.count();
  const courseCount = await prisma.course.count();

  if (businessCount > 0 || adminCount > 0 || courseCount > 0) {
    console.log("⚠️ Database already seeded or contains master data. Skipping seeding.");
    return;
  }

  console.log("🌱 Database is empty. Seeding production master data...");

  // 2. Businesses
  const ramesys = await prisma.business.create({
    data: { name: "Ramesys", type: BusinessType.IT_SERVICES },
  });

  const vydhra = await prisma.business.create({
    data: { name: "Vydhra", type: BusinessType.COURSE_SELLING },
  });

  console.log("✅ Businesses created");

  // 3. Vydhra Courses & Batches
  for (const course of coursesData) {
    const createdCourse = await prisma.course.create({
      data: {
        businessId: vydhra.id,
        slug: course.slug,
        name: course.title,
        description: course.description,
        details: course as any,
        pricing: {
          createMany: {
            data: [
              {
                currency: "USD",
                amount: (course as any).priceUSD ?? (course as any).price ?? 0,
              },
              ...((course as any).priceINR
                ? [{ currency: "INR", amount: (course as any).priceINR }]
                : []),
            ],
          },
        },
      },
    });

    // Create a default launch batch for each course
    await prisma.courseBatch.create({
      data: {
        courseId: createdCourse.id,
        name: "Cohort 1 (Launch Batch)",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // starts in 7 days
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000), // runs for 60 days
        maxSeats: 50,
        status: BatchStatus.UPCOMING,
      },
    });
  }

  console.log("✅ Courses and Course Batches created");

  // 4. Admin Users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.create({
    data: {
      email: "admin@vydhra.in",
      password: hashedPassword,
      name: "Vydhra Admin",
      role: "SUPERADMIN",
    },
  });

  console.log("✅ Admin user created (admin@vydhra.in / admin123)");
  console.log("\n🎉 Production seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

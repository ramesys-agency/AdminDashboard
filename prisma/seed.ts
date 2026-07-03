/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BusinessType,
  CommissionType,
  DiscountType,
  BatchStatus,
} from "@prisma/client";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { coursesData } from "./data/courses";

async function main() {
  console.log("🌱 Checking database for existing data...");

  // Leave if any Business, AdminUser or Course is already present
  const businessCount = await prisma.business.count();
  const adminCount = await prisma.adminUser.count();
  const courseCount = await prisma.course.count();

  if (businessCount > 0 || adminCount > 0 || courseCount > 0) {
    console.log("⚠️ Database already seeded or contains master data. Skipping seeding.");
    return;
  }

  console.log("🧹 Cleaning up database...");
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.courseBatch.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.adminUser.deleteMany({});

  console.log("🌱 Seeding database...");

  // ─── Businesses ──────────────────────────────────────────────
  const ramesys = await prisma.business.upsert({
    where: { name: "Ramesys" },
    update: {},
    create: { name: "Ramesys", type: BusinessType.IT_SERVICES },
  });

  const vydhra = await prisma.business.upsert({
    where: { name: "Vydhra" },
    update: {},
    create: { name: "Vydhra", type: BusinessType.COURSE_SELLING },
  });

  console.log("✅ Businesses created");

  // ─── Ramesys Clients ─────────────────────────────────────────
  const client1 = await prisma.client.upsert({
    where: { email: "arun.mehta@techcorp.in" },
    update: {},
    create: {
      businessId: ramesys.id,
      name: "Arun Mehta",
      email: "arun.mehta@techcorp.in",
      phone: "+91 98765 43210",
      company: "TechCorp Solutions",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: "priya.sharma@innowave.io" },
    update: {},
    create: {
      businessId: ramesys.id,
      name: "Priya Sharma",
      email: "priya.sharma@innowave.io",
      phone: "+91 87654 32109",
      company: "InnoWave Technologies",
    },
  });

  // ─── Project ──────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client1.id,
      name: "E-Commerce Platform Redesign",
      description: "Full redesign of the existing e-commerce website.",
      status: "IN_PROGRESS",
      budget: 450000,
    },
  });

  console.log("✅ Ramesys base data created");

  // ─── Vydhra Courses & Batches ──────────────────────────────────
  const courses: any[] = [];
  const batches: any[] = [];
  for (const course of coursesData) {
    const priceUSD = (course as any).priceUSD ?? (course as any).price ?? 0;
    const priceINR = (course as any).priceINR as number | undefined;

    const createdCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        name: course.title,
        description: course.description,
        details: course as any,
      },
      create: {
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
                amount: priceUSD,
                originalPrice: Math.round(priceUSD * 1.5),
              },
              ...(priceINR
                ? [
                    {
                      currency: "INR",
                      amount: priceINR,
                      originalPrice: Math.round((priceINR * 1.5) / 1000) * 1000 - 1,
                    },
                  ]
                : []),
            ],
          },
        },
      },
    });
    courses.push(createdCourse);

    // Create a default batch for each course (with its own pricing)
    const createdBatch = await prisma.courseBatch.create({
      data: {
        courseId: createdCourse.id,
        name: "Cohort 1 (Launch Batch)",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000),
        maxSeats: 50,
        status: BatchStatus.UPCOMING,
        whatsappGroupUrl: `https://chat.whatsapp.com/${course.slug}-cohort-1`,
        pricing: {
          createMany: {
            data: [
              {
                currency: "USD",
                amount: priceUSD,
                originalPrice: Math.round(priceUSD * 1.5),
              },
              ...(priceINR
                ? [
                    {
                      currency: "INR",
                      amount: priceINR,
                      originalPrice: Math.round((priceINR * 1.5) / 1000) * 1000 - 1,
                    },
                  ]
                : []),
            ],
          },
        },
      },
    });
    batches.push(createdBatch);
  }

  console.log("✅ Courses and Course Batches created");

  // ─── Vydhra Students ──────────────────────────────────────────
  const student1 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Rahul Khanna",
      email: "rahul.khanna@example.com",
      phone: "+91 90000 11111",
      country: "IN",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Ananya Goyal",
      email: "ananya.g@example.com",
      phone: "+91 91111 22222",
      country: "IN",
    },
  });

  const student3 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Vikram Singh",
      email: "vikram.s@example.com",
      phone: "+1 415 555 0133",
      country: "US",
    },
  });

  console.log("✅ Students created");

  // ─── Course Enrollments ───────────────────────────────────────
  const enr1 = await prisma.courseEnrollment.create({
    data: {
      studentId: student1.id,
      courseId: courses[1].id, // MERN + AI
      batchId: batches[1].id, // MERN + AI Batch
      status: "ENROLLED",
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
    },
  });

  const enr2 = await prisma.courseEnrollment.create({
    data: {
      studentId: student2.id,
      courseId: courses[1].id, // MERN + AI
      batchId: batches[1].id, // MERN + AI Batch
      status: "ENROLLED",
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
    },
  });

  const enr3 = await prisma.courseEnrollment.create({
    data: {
      studentId: student3.id,
      courseId: courses[0].id, // AI Agents
      batchId: batches[0].id, // AI Agents Batch
      status: "ENROLLED",
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      studentId: student1.id,
      courseId: courses[4].id, // SQL
      batchId: batches[4].id, // SQL Batch
      status: "COMPLETED",
      acceptedTerms: true,
      acceptedTermsAt: new Date("2026-01-15"),
    },
  });

  console.log("✅ Course Enrollments created");

  // ─── Vydhra Agents & Coupons ───────────────────────────────
  // Agent Ravi with 10% percentage commission
  const agentRavi = await prisma.agent.create({
    data: {
      businessId: vydhra.id,
      name: "Ravi Karthik",
      email: "ravi.karthik@vydhra.in",
      phone: "+91 99887 76655",
      code: "RAVI10",
      commissionType: CommissionType.PERCENTAGE,
      commissionValue: 10,
      totalEarned: 8100,
      totalPaid: 5000,
      additionalAmount: 0,
    },
  });

  const couponRavi = await prisma.coupon.create({
    data: {
      businessId: vydhra.id,
      code: "RAVI10",
      maxUses: 100,
      currentUses: 2, // matches the two seeded payments below
      discounts: {
        createMany: {
          data: [
            { currency: "USD", discountType: DiscountType.PERCENTAGE, discountValue: 10 },
            { currency: "INR", discountType: DiscountType.PERCENTAGE, discountValue: 10 },
          ],
        },
      },
    },
  });

  // Agent Sanya with $2000 flat commission
  const agentSanya = await prisma.agent.create({
    data: {
      businessId: vydhra.id,
      name: "Sanya Malhotra",
      email: "sanya.m@vydhra.in",
      phone: "+91 98888 77777",
      code: "SANYA5",
      commissionType: CommissionType.FLAT,
      commissionValue: 2000,
      totalEarned: 2000,
      totalPaid: 0,
      additionalAmount: 0,
    },
  });

  const couponSanya = await prisma.coupon.create({
    data: {
      businessId: vydhra.id,
      code: "SANYA5",
      maxUses: 50,
      currentUses: 1, // matches the one seeded payment below
      discounts: {
        createMany: {
          data: [
            { currency: "USD", discountType: DiscountType.FLAT, discountValue: 100 },
            { currency: "INR", discountType: DiscountType.FLAT, discountValue: 5000 },
          ],
        },
      },
    },
  });

  console.log("✅ Agents and Coupons created");

  // ─── Vydhra Payments & Invoices ───────────────────────────────

  // 1. Payment using Ravi's code (COMPLETED)
  const inv1 = await prisma.invoice.create({
    data: {
      businessId: vydhra.id,
      amount: 40500, // 45000 - 10%
      status: "PAID",
      dueDate: new Date(),
      invoiceLink: "https://vydhra.com/inv/1001",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: vydhra.id,
      studentId: student1.id,
      invoiceId: inv1.id,
      amount: 40500,
      currency: "INR",
      amountInINR: 40500,
      exchangeRate: 1.0,
      status: "COMPLETED",
      method: "UPI",
      agentId: agentRavi.id,
      couponId: couponRavi.id,
      courseEnrollmentId: enr1.id,
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
      razorpayOrderId: "order_seed_0000000001",
      razorpayPaymentId: "pay_seed_0000000001",
    },
  });

  // 2. Another Payment using Ravi's code (COMPLETED)
  const inv2 = await prisma.invoice.create({
    data: {
      businessId: vydhra.id,
      amount: 40500,
      status: "PAID",
      dueDate: new Date(),
      invoiceLink: "https://vydhra.com/inv/1002",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: vydhra.id,
      studentId: student2.id,
      invoiceId: inv2.id,
      amount: 40500,
      currency: "INR",
      amountInINR: 40500,
      exchangeRate: 1.0,
      status: "COMPLETED",
      method: "CARD",
      agentId: agentRavi.id,
      couponId: couponRavi.id,
      courseEnrollmentId: enr2.id,
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
      razorpayOrderId: "order_seed_0000000002",
      razorpayPaymentId: "pay_seed_0000000002",
    },
  });

  // 3. USD Payment using Sanya's code (COMPLETED) — exercises exchangeRate
  const inv3 = await prisma.invoice.create({
    data: {
      businessId: vydhra.id,
      amount: 499, // AI Agents $599 - $100 flat coupon
      status: "PAID",
      dueDate: new Date(),
      invoiceLink: "https://vydhra.com/inv/1003",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: vydhra.id,
      studentId: student3.id,
      invoiceId: inv3.id,
      amount: 499,
      currency: "USD",
      amountInINR: 41666.5, // 499 * 83.5
      exchangeRate: 83.5,
      status: "COMPLETED",
      method: "CARD",
      agentId: agentSanya.id,
      couponId: couponSanya.id,
      courseEnrollmentId: enr3.id,
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
      razorpayOrderId: "order_seed_0000000003",
      razorpayPaymentId: "pay_seed_0000000003",
    },
  });

  // 4. Pending Payment (Not using agent)
  const inv4 = await prisma.invoice.create({
    data: {
      businessId: vydhra.id,
      amount: 25000,
      status: "PENDING",
      dueDate: new Date("2025-05-01"),
      invoiceLink: "https://vydhra.com/inv/1004",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: vydhra.id,
      studentId: student1.id,
      invoiceId: inv4.id,
      amount: 10000, // Partial
      currency: "INR",
      amountInINR: 10000,
      exchangeRate: 1.0,
      status: "PENDING",
      method: "UPI",
    },
  });

  console.log("✅ Vydhra Payments & Invoices created");

  // ─── Admin Users ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@vydhra.in" },
    update: { password: hashedPassword },
    create: {
      email: "admin@vydhra.in",
      password: hashedPassword,
      name: "Vydhra Admin",
      role: "SUPERADMIN",
    },
  });

  console.log("✅ Admin user created (admin@vydhra.in / admin123)");

  // ─── Enquiries ───────────────────────────────────────────────
  await prisma.enquiry.createMany({
    data: [
      {
        businessId: vydhra.id,
        name: "Suresh Patel",
        email: "suresh.p@example.com",
        phone: "+91 91234 56789",
        message:
          "Interested in the AI course. Do you offer placement assistance?",
        status: "NEW",
      },
      {
        businessId: vydhra.id,
        name: "Meena Raj",
        email: "meena.r@example.com",
        message: "Looking for a corporate training for our design team.",
        status: "CONTACTED",
      },
    ],
  });

  console.log("✅ Enquiries created");
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/* eslint-disable @typescript-eslint/no-unused-vars */
import { BusinessType, CommissionType, DiscountType } from "@prisma/client";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
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

  // ─── Vydhra Courses ──────────────────────────────────────────
  const course1 = await prisma.course.create({
    data: {
      businessId: vydhra.id,
      name: "Full Stack Web Development (MERN)",
      description:
        "Master React, Node.js, and MongoDB with real-world projects.",
      price: 45000,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      businessId: vydhra.id,
      name: "AI & Machine Learning Bootcamp",
      description: "Learn Python, TensorFlow, and PyTorch from scratch.",
      price: 65000,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      businessId: vydhra.id,
      name: "UI/UX Design Masterclass",
      description: "Learn Figma, Adobe XD and advanced prototyping.",
      price: 25000,
    },
  });

  console.log("✅ Courses created");

  // ─── Vydhra Students ──────────────────────────────────────────
  const student1 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Rahul Khanna",
      email: "rahul.khanna@example.com",
      phone: "+91 90000 11111",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Ananya Goyal",
      email: "ananya.g@example.com",
      phone: "+91 91111 22222",
    },
  });

  const student3 = await prisma.student.create({
    data: {
      businessId: vydhra.id,
      name: "Vikram Singh",
      email: "vikram.s@example.com",
      phone: "+91 92222 33333",
    },
  });

  console.log("✅ Students created");

  // ─── Course Enrollments ───────────────────────────────────────
  const enr1 = await prisma.courseEnrollment.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      status: "ENROLLED",
    },
  });

  const enr2 = await prisma.courseEnrollment.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
      status: "ENROLLED",
    },
  });

  const enr3 = await prisma.courseEnrollment.create({
    data: {
      studentId: student3.id,
      courseId: course2.id,
      status: "ENROLLED",
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      studentId: student1.id,
      courseId: course3.id,
      status: "COMPLETED",
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
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      maxUses: 100,
    },
  });

  // Agent Sanya with ₹2000 flat commission
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
      discountType: DiscountType.FLAT,
      discountValue: 1000, // Changed to Flat ₹1000
      maxUses: 50,
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
      status: "COMPLETED",
      method: "UPI",
      agentId: agentRavi.id,
      couponId: couponRavi.id,
      courseEnrollmentId: enr1.id,
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
      status: "COMPLETED",
      method: "CARD",
      agentId: agentRavi.id,
      couponId: couponRavi.id,
      courseEnrollmentId: enr2.id,
    },
  });

  // 3. Payment using Sanya's code (COMPLETED)
  const inv3 = await prisma.invoice.create({
    data: {
      businessId: vydhra.id,
      amount: 61750, // 65000 - 5%
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
      amount: 61750,
      status: "COMPLETED",
      method: "BANK_TRANSFER",
      agentId: agentSanya.id,
      couponId: couponSanya.id,
      courseEnrollmentId: enr3.id,
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

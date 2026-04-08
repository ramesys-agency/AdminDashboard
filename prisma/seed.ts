import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Businesses ──────────────────────────────────────────────
  const ramesys = await prisma.business.upsert({
    where: { name: "Ramesys" },
    update: {},
    create: { name: "Ramesys", type: "IT_SERVICES" },
  });

  const vydhra = await prisma.business.upsert({
    where: { name: "Vydhra" },
    update: {},
    create: { name: "Vydhra", type: "COURSE_SELLING" },
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

  const client3 = await prisma.client.upsert({
    where: { email: "rohit.joshi@nexgen.com" },
    update: {},
    create: {
      businessId: ramesys.id,
      name: "Rohit Joshi",
      email: "rohit.joshi@nexgen.com",
      phone: "+91 76543 21098",
      company: "NexGen Digital",
    },
  });

  const client4 = await prisma.client.upsert({
    where: { email: "kavya.nair@brightmind.co" },
    update: {},
    create: {
      businessId: ramesys.id,
      name: "Kavya Nair",
      email: "kavya.nair@brightmind.co",
      phone: "+91 65432 10987",
      company: "BrightMind Consultancy",
    },
  });

  console.log("✅ Clients created");

  // ─── Projects ────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client1.id,
      name: "E-Commerce Platform Redesign",
      description: "Full redesign of the existing e-commerce website with modern UI/UX and improved performance.",
      status: "IN_PROGRESS",
      startDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-31"),
      budget: 450000,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client1.id,
      name: "Mobile App Development",
      description: "Cross-platform mobile app for Android and iOS using React Native.",
      status: "PENDING",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-08-31"),
      budget: 320000,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client2.id,
      name: "CRM System Integration",
      description: "Custom CRM integration with existing ERP and communication tools.",
      status: "COMPLETED",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-12-31"),
      budget: 280000,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client3.id,
      name: "Cloud Infrastructure Setup",
      description: "AWS cloud setup with CI/CD pipelines, monitoring and autoscaling.",
      status: "IN_PROGRESS",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-05-15"),
      budget: 195000,
    },
  });

  const project5 = await prisma.project.create({
    data: {
      businessId: ramesys.id,
      clientId: client4.id,
      name: "HR Portal Development",
      description: "Internal HR portal with leave management, payroll, and attendance tracking.",
      status: "PENDING",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-09-30"),
      budget: 175000,
    },
  });

  console.log("✅ Projects created");

  // ─── Invoices ────────────────────────────────────────────────
  const invoice1 = await prisma.invoice.create({
    data: {
      businessId: ramesys.id,
      projectId: project1.id,
      amount: 150000,
      status: "PAID",
      dueDate: new Date("2024-11-30"),
      invoiceLink: "https://invoice.ramesys.in/INV-2024-001",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      businessId: ramesys.id,
      projectId: project1.id,
      amount: 150000,
      status: "PENDING",
      dueDate: new Date("2025-02-28"),
      invoiceLink: "https://invoice.ramesys.in/INV-2024-002",
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      businessId: ramesys.id,
      projectId: project3.id,
      amount: 280000,
      status: "PAID",
      dueDate: new Date("2025-01-15"),
      invoiceLink: "https://invoice.ramesys.in/INV-2024-003",
    },
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      businessId: ramesys.id,
      projectId: project4.id,
      amount: 97500,
      status: "PENDING",
      dueDate: new Date("2025-03-31"),
      invoiceLink: "https://invoice.ramesys.in/INV-2025-001",
    },
  });

  console.log("✅ Invoices created");

  // ─── Payments ────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project1.id,
      invoiceId: invoice1.id,
      amount: 150000,
      status: "COMPLETED",
      method: "BANK_TRANSFER",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project1.id,
      invoiceId: invoice2.id,
      amount: 75000,
      status: "COMPLETED",
      method: "UPI",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project3.id,
      invoiceId: invoice3.id,
      amount: 140000,
      status: "COMPLETED",
      method: "BANK_TRANSFER",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project3.id,
      invoiceId: invoice3.id,
      amount: 140000,
      status: "COMPLETED",
      method: "CARD",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project4.id,
      invoiceId: invoice4.id,
      amount: 50000,
      status: "PENDING",
      method: "BANK_TRANSFER",
    },
  });

  await prisma.payment.create({
    data: {
      businessId: ramesys.id,
      projectId: project2.id,
      amount: 80000,
      status: "FAILED",
      method: "CARD",
    },
  });

  console.log("✅ Payments created");

  // ─── Admin Users ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@ramesys.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@ramesys.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "SUPERADMIN",
    },
  });
  console.log("✅ Admin user created (admin@ramesys.com / admin123)");

  // ─── Enquiries ───────────────────────────────────────────────
  await prisma.enquiry.createMany({
    skipDuplicates: true,
    data: [
      {
        businessId: ramesys.id,
        name: "Suresh Patel",
        email: "suresh.patel@startup.in",
        phone: "+91 91234 56789",
        message: "We need a custom ERP solution for our manufacturing business. Looking for a team that can handle end-to-end development including mobile app. Budget is approximately ₹5-8 lakhs. Please get in touch.",
        status: "NEW",
      },
      {
        businessId: ramesys.id,
        name: "Meena Rajendran",
        email: "meena.r@eduglobal.com",
        phone: "+91 82345 67890",
        message: "We are an education company looking to build a live-class platform similar to Zoom but integrated with our LMS. Would love to discuss timelines and costs.",
        status: "CONTACTED",
      },
      {
        businessId: ramesys.id,
        name: "Ankit Verma",
        email: "ankit.verma@retailmax.co.in",
        phone: "+91 73456 78901",
        message: "Need a POS system with inventory management for a chain of 5 retail stores. Should work offline too.",
        status: "RESOLVED",
      },
      {
        businessId: ramesys.id,
        name: "Deepa Krishnan",
        email: "deepa.k@healthcare.org",
        phone: "+91 64567 89012",
        message: "Hospital management software — OPD scheduling, patient records, billing, and pharmacy integration. Need HIPAA-compliant architecture.",
        status: "NEW",
      },
    ],
  });

  console.log("✅ Enquiries created");

  // ─── Vydhra — Agents & Coupons ───────────────────────────────
  await prisma.agent.upsert({
    where: { email: "ravi.karthik@vydhra.in" },
    update: {},
    create: {
      businessId: vydhra.id,
      name: "Ravi Karthik",
      email: "ravi.karthik@vydhra.in",
      phone: "+91 99887 76655",
      code: "RAVI10",
      discountPercent: 10,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "LAUNCH25" },
    update: {},
    create: {
      businessId: vydhra.id,
      code: "LAUNCH25",
      discountPercent: 25,
      maxUses: 100,
      currentUses: 34,
      validUntil: new Date("2025-12-31"),
    },
  });

  console.log("✅ Vydhra agents & coupons created");
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

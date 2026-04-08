"use server";

import prisma from "@/lib/prisma";

export async function getClients() {
  return prisma.client.findMany({
    where: { business: { type: "IT_SERVICES" } },
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          payments: true,
          invoices: true,
        },
      },
    },
  });
}

export async function getProjects() {
  return prisma.project.findMany({
    where: { business: { type: "IT_SERVICES" } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      payments: true,
      invoices: true,
    },
  });
}

export async function getPayments() {
  return prisma.payment.findMany({
    where: { business: { type: "IT_SERVICES" } },
    include: { project: true, invoice: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      project: true,
      invoice: true,
      agent: true,
      coupon: true,
      student: true,
    },
  });
}

export async function getInvoices() {
  return prisma.invoice.findMany({
    where: { business: { type: "IT_SERVICES" } },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      project: true,
      payments: true,
    },
  });
}

export async function getEnquiries() {
  return prisma.enquiry.findMany({
    where: { business: { type: "IT_SERVICES" } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEnquiryById(id: string) {
  return prisma.enquiry.findUnique({
    where: { id },
  });
}

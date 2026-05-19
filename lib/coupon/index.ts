import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetCouponsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCoupons({ page = 1, limit = 10, search }: GetCouponsParams = {}) {
  const skip = (page - 1) * limit;

  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) return { data: [], metadata: { total: 0, page, limit, pages: 0 } };

  const where: Prisma.CouponWhereInput = {
    businessId: vydhra.id,
    ...(search && { OR: [{ code: { contains: search, mode: "insensitive" } }] }),
  };

  const [total, data] = await Promise.all([
    prisma.coupon.count({ where }),
    prisma.coupon.findMany({
      where,
      include: { discounts: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return { data, metadata: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
    include: {
      discounts: true,
      payments: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createCoupon(data: {
  code: string;
  discounts: { currency: string; discountType: "PERCENTAGE" | "FLAT"; discountValue: number }[];
  maxUses?: number | null;
  validUntil?: string | null;
}) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase().trim(),
      businessId: vydhra.id,
      maxUses: data.maxUses ?? null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      discounts: {
        createMany: {
          data: data.discounts.map((d) => ({
            currency: d.currency,
            discountType: d.discountType,
            discountValue: d.discountValue,
          })),
        },
      },
    },
    include: { discounts: true },
  });
}

export async function updateCoupon(
  id: string,
  data: {
    discounts?: { currency: string; discountType: "PERCENTAGE" | "FLAT"; discountValue: number }[];
    maxUses?: number | null;
    validUntil?: string | null;
  }
) {
  if (data.discounts !== undefined) {
    await prisma.couponDiscount.deleteMany({ where: { couponId: id } });
  }

  return prisma.coupon.update({
    where: { id },
    data: {
      maxUses: data.maxUses ?? undefined,
      validUntil: data.validUntil !== undefined ? (data.validUntil ? new Date(data.validUntil) : null) : undefined,
      ...(data.discounts !== undefined && {
        discounts: { createMany: { data: data.discounts } },
      }),
    },
    include: { discounts: true },
  });
}

import prisma from "@/lib/prisma";

// The Vydhra (course-selling) business row is created once by the seed and its
// id never changes — memoize per server process to avoid re-querying it on
// every request from every module.
let vydhraId: string | null = null;

export async function getVydhraBusinessId(): Promise<string> {
  if (vydhraId) return vydhraId;
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });
  if (!vydhra) throw new Error("Vydhra business not found");
  vydhraId = vydhra.id;
  return vydhraId;
}

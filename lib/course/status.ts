// A course's Live / Coming Soon state lives inside the free-form
// `Course.details` JSON blob, under `status`. Only an explicit "COMING_SOON"
// hides a course — a missing or unrecognised status means it is live.
//
// Kept free of prisma imports so client components can share it with the
// server-side enrollment guard.

export type CourseStatus = "LIVE" | "COMING_SOON";

export function getCourseStatus(details: unknown): CourseStatus {
  if (details && typeof details === "object" && !Array.isArray(details)) {
    if ((details as Record<string, unknown>).status === "COMING_SOON") {
      return "COMING_SOON";
    }
  }
  return "LIVE";
}

export function isCourseComingSoon(details: unknown): boolean {
  return getCourseStatus(details) === "COMING_SOON";
}

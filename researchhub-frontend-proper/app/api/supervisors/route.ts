import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/supervisors?q=&department=&area=&accepting=true
export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const department = searchParams.get("department")?.trim();
  const area = searchParams.get("area")?.trim();
  const acceptingOnly = searchParams.get("accepting") === "true";

  const where: any = { role: "SUPERVISOR" };
  if (department) where.department = department;
  if (acceptingOnly) where.acceptingStudents = true;
  if (area) where.researchAreas = { contains: area, mode: "insensitive" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { researchAreas: { contains: q, mode: "insensitive" } },
      { department: { contains: q, mode: "insensitive" } },
    ];
  }

  const supervisors = await prisma.user.findMany({
    where,
    select: {
      id: true, name: true, designation: true, department: true,
      researchAreas: true, bio: true, acceptingStudents: true,
      reviewsReceived: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withRatings = supervisors.map(({ reviewsReceived, ...s }) => {
    const count = reviewsReceived.length;
    const avg = count ? reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { ...s, rating: { avg, count } };
  });

  return NextResponse.json(withRatings);
}

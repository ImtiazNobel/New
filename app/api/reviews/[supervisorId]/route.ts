import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/reviews/:supervisorId — all reviews for a supervisor, newest first
export async function GET(_req: Request, { params }: { params: { supervisorId: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const reviews = await prisma.review.findMany({
    where: { supervisorId: params.supervisorId },
    include: { student: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      studentId: r.studentId, studentName: r.student.name,
      rating: r.rating, text: r.text, ts: r.createdAt,
    }))
  );
}

// POST /api/reviews/:supervisorId  body: { rating, text }
// One review per student per supervisor — resubmitting updates it (upsert).
export async function POST(req: Request, { params }: { params: { supervisorId: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.role !== "STUDENT") return NextResponse.json({ error: "Only students can leave reviews" }, { status: 403 });

  const { rating, text } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { studentId_supervisorId: { studentId: me.id, supervisorId: params.supervisorId } },
    update: { rating, text: text?.trim() ?? null },
    create: { studentId: me.id, supervisorId: params.supervisorId, rating, text: text?.trim() ?? null },
  });

  return NextResponse.json(review);
}

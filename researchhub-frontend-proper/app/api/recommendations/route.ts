import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/recommendations?type=received|sent
export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.role !== "SUPERVISOR") return NextResponse.json({ error: "Only supervisors use recommendations" }, { status: 403 });

  const type = new URL(req.url).searchParams.get("type") ?? "received";

  const recs = await prisma.recommendation.findMany({
    where: type === "sent" ? { fromId: me.id } : { toId: me.id },
    include: {
      student: { select: { id: true, name: true } },
      from: { select: { id: true, name: true } },
      to: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    recs.map((r) => ({
      studentId: r.student.id, studentName: r.student.name,
      fromId: r.from.id, fromName: r.from.name,
      toId: r.to.id, toName: r.to.name,
      note: r.note, ts: r.createdAt,
    }))
  );
}

// POST /api/recommendations  body: { studentId, toId, note }
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.role !== "SUPERVISOR") return NextResponse.json({ error: "Only supervisors can send recommendations" }, { status: 403 });

  const { studentId, toId, note } = await req.json();
  if (!studentId || !toId) return NextResponse.json({ error: "studentId and toId are required" }, { status: 400 });
  if (toId === me.id) return NextResponse.json({ error: "Cannot recommend to yourself" }, { status: 400 });

  const rec = await prisma.recommendation.create({
    data: { studentId, fromId: me.id, toId, note: note?.trim() || null },
  });

  return NextResponse.json(rec);
}

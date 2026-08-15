import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/bookmarks — the logged-in student's saved supervisors
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { studentId: me.id },
    include: { supervisor: { select: { id: true, name: true, designation: true, acceptingStudents: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks.map((b) => b.supervisor));
}

// POST /api/bookmarks  body: { supervisorId }
// Toggles the bookmark — creates it if missing, deletes it if present.
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.role !== "STUDENT") return NextResponse.json({ error: "Only students can bookmark supervisors" }, { status: 403 });

  const { supervisorId } = await req.json();
  if (!supervisorId) return NextResponse.json({ error: "supervisorId is required" }, { status: 400 });

  const existing = await prisma.bookmark.findUnique({
    where: { studentId_supervisorId: { studentId: me.id, supervisorId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.bookmark.create({ data: { studentId: me.id, supervisorId } });
    return NextResponse.json({ saved: true });
  }
}

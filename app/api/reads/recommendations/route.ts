import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// POST /api/reads/recommendations — marks all received recommendations as seen
export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.user.update({
    where: { id: me.id },
    data: { recommendationReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

// GET — how many recommendations arrived since the last read, for the nav badge
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  const since = user?.recommendationReadAt ?? new Date(0);

  const count = await prisma.recommendation.count({
    where: { toId: me.id, createdAt: { gt: since } },
  });

  return NextResponse.json({ unreadCount: count });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  return NextResponse.json(user);
}

// PATCH /api/users/me
// Used both for the one-time role selection + initial profile setup,
// and for later edits from the "My Profile" page.
export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // Whitelist editable fields — never let the client set id/email/password/role-lock etc. directly here
  const allowed = [
    "role", "university", "fieldOfInterest", "designation", "department",
    "researchAreas", "skills", "projectIdeas", "publications", "bio",
    "phone", "roomNo", "website", "acceptingStudents", "name",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.user.update({ where: { id: me.id }, data });
  return NextResponse.json(updated);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/users/:id — public-facing profile (used by the ProfileModal in chat, directory, etc.)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, role: true, image: true,
      university: true, fieldOfInterest: true,
      designation: true, department: true, researchAreas: true,
      skills: true, projectIdeas: true, publications: true, bio: true,
      phone: true, roomNo: true, website: true, acceptingStudents: true,
      email: true, // shown as public contact email, matching the current UI
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

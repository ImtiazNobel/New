import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/messages/:contactId — full thread with one contact, and marks it read
export async function GET(_req: Request, { params }: { params: { contactId: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const contactId = params.contactId;

  const thread = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: me.id, toId: contactId },
        { fromId: contactId, toId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // mark read
  await prisma.messageRead.upsert({
    where: { userId_contactId: { userId: me.id, contactId } },
    update: { lastReadAt: new Date() },
    create: { userId: me.id, contactId, lastReadAt: new Date() },
  });

  return NextResponse.json(thread);
}

// POST /api/messages/:contactId  body: { text }
export async function POST(req: Request, { params }: { params: { contactId: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const message = await prisma.message.create({
    data: { fromId: me.id, toId: params.contactId, text: text.trim() },
  });

  return NextResponse.json(message);
}

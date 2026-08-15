import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/conversations — every conversation the user is part of, with last message + unread count
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { OR: [{ fromId: me.id }, { toId: me.id }] },
    orderBy: { createdAt: "desc" },
  });

  const reads = await prisma.messageRead.findMany({ where: { userId: me.id } });
  const readMap = new Map(reads.map((r) => [r.contactId, r.lastReadAt]));

  // group by the "other" participant
  const byContact = new Map<string, typeof messages>();
  for (const m of messages) {
    const otherId = m.fromId === me.id ? m.toId : m.fromId;
    if (!byContact.has(otherId)) byContact.set(otherId, []);
    byContact.get(otherId)!.push(m);
  }

  const contactIds = [...byContact.keys()];
  const contacts = await prisma.user.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, role: true },
  });
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const result = contactIds.map((id) => {
    const msgs = byContact.get(id)!;
    const last = msgs[0]; // already sorted desc
    const lastReadAt = readMap.get(id) ?? new Date(0);
    const unreadCount = msgs.filter((m) => m.toId === me.id && m.createdAt > lastReadAt).length;
    const contact = contactMap.get(id);
    return {
      id, name: contact?.name ?? "Unknown", role: contact?.role ?? null,
      lastMsg: last?.text ?? "", lastAt: last?.createdAt ?? null,
      unreadCount,
    };
  });

  result.sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
  return NextResponse.json(result);
}

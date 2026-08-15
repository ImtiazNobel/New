import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/signup
// body: { name, email, password }
// Creates the account (role is chosen afterward via PATCH /api/users/me).
export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists. Try logging in instead." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed },
  });

  // Note: this route does NOT send a verification email — wire up a provider
  // (Resend, SendGrid, Postmark, etc.) here if you want real email verification.
  return NextResponse.json({ id: user.id, email: user.email });
}

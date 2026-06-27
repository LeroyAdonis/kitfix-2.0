import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, session as sessionTable, account } from "@/lib/db/schema";
import { createSessionToken, verifySessionToken } from "@/lib/auth-jwt";

const SALT_ROUNDS = 10;

// Better Auth scrypt config (for migrating existing passwords)
const BA_SCRYPT = { N: 16384, r: 16, p: 1, dkLen: 64, maxmem: 128 * 16384 * 16 * 2 } as const;

function generateId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Verify a password that may use the old Better Auth scrypt format.
 * Format: "salt:hash" (both hex-encoded).
 * If it matches, re-hash with bcrypt and return the new hash.
 * Returns { valid: true, newHash?: string } or { valid: false }.
 */
async function verifyLegacyPassword(storedHash: string, password: string): Promise<{ valid: boolean; newHash?: string; debug?: string }> {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return { valid: false, debug: `split failed: ${parts.length} parts` };
  
  const [saltHex, keyHex] = parts;
  if (!saltHex || !keyHex) return { valid: false, debug: "empty salt or key" };
  
  try {
    const salt = Buffer.from(saltHex, "hex");
    const derived = await new Promise<Buffer>((resolve, reject) => {
      scrypt(password.normalize("NFKC"), salt, BA_SCRYPT.dkLen, {
        N: BA_SCRYPT.N,
        r: BA_SCRYPT.r,
        p: BA_SCRYPT.p,
        maxmem: BA_SCRYPT.maxmem,
      }, (err, key) => {
        if (err) reject(err);
        else resolve(key as Buffer);
      });
    });
    const expectedKey = Buffer.from(keyHex, "hex");
    if (derived.length !== expectedKey.length) {
      return { valid: false, debug: `length mismatch: ${derived.length} vs ${expectedKey.length}` };
    }
    
    if (timingSafeEqual(derived, expectedKey)) {
      const newHash = await bcrypt.hash(password, SALT_ROUNDS);
      return { valid: true, newHash };
    }
    return { valid: false, debug: "hash mismatch" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, debug: `scrypt error: ${msg}` };
  }
}

function getCookieToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  return cookies["better-auth.session_token"] ?? null;
}

async function handleSignUp(request: NextRequest): Promise<NextResponse> {
  try {
    const body: { email?: string; password?: string; name?: string } = await request.json();
    const { email, password, name } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = generateId();

    await db.insert(user).values({
      id: userId,
      name: name || email.split("@")[0],
      email,
      emailVerified: false,
      role: "customer",
    });

    await db.insert(account).values({
      id: generateId(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    });

    const sessionId = generateId();
    const jwtToken = await createSessionToken({ userId, role: "customer", sessionId });

    const response = NextResponse.json({
      token: jwtToken,
      user: { id: userId, name: name || email.split("@")[0], email, role: "customer" },
    });
    response.cookies.set("better-auth.session_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleSignIn(request: NextRequest): Promise<NextResponse> {
  try {
    const body: { email?: string; password?: string } = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const userRecord = users[0];

    if (!password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const accounts = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userRecord.id), eq(account.providerId, "credential")),
      )
      .limit(1);

    if (accounts.length === 0 || !accounts[0].password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(password, accounts[0].password);
    if (!passwordValid) {
      // Try legacy Better Auth scrypt format
      const legacy = await verifyLegacyPassword(accounts[0].password, password);
      if (!legacy.valid) {
        return NextResponse.json({ 
          error: "Invalid email or password",
          _debug: { hashPreview: accounts[0].password.slice(0, 20) + "...", legacyError: legacy.debug }
        }, { status: 401 });
      }
      // Migrate to bcrypt
      if (legacy.newHash) {
        await db.update(account)
          .set({ password: legacy.newHash })
          .where(eq(account.id, accounts[0].id));
      }
    }

    const sessions = await db
      .select()
      .from(sessionTable)
      .where(
        and(
          eq(sessionTable.userId, userRecord.id),
          gt(sessionTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const sessionId = sessions.length > 0 ? sessions[0].id : generateId();

    const jwtToken = await createSessionToken({
      userId: userRecord.id,
      role: userRecord.role,
      sessionId,
    });

    const response = NextResponse.json({
      token: jwtToken,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        image: userRecord.image,
      },
    });
    response.cookies.set("better-auth.session_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetSession(request: NextRequest): Promise<NextResponse> {
  const token = getCookieToken(request);
  if (!token) {
    return NextResponse.json({ session: null, user: null });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ session: null, user: null });
  }

  try {
    const users = await db.select().from(user).where(eq(user.id, payload.userId)).limit(1);
    if (users.length === 0) {
      return NextResponse.json({ session: null, user: null });
    }

    return NextResponse.json({
      session: {
        id: payload.sessionId,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        impersonatedBy: null,
      },
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        emailVerified: users[0].emailVerified,
        image: users[0].image,
        role: users[0].role,
        createdAt: users[0].createdAt,
        updatedAt: users[0].updatedAt,
        banned: users[0].banned,
        banReason: users[0].banReason,
        banExpires: users[0].banExpires,
      },
    });
  } catch {
    return NextResponse.json({ session: null, user: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ all: string[] }> }) {
  const { all } = await params;
  const path = all.join("/");

  if (path === "sign-up/email") {
    return handleSignUp(request);
  }
  if (path === "sign-in/email") {
    return handleSignIn(request);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: NextRequest) {
  return handleGetSession(request);
}

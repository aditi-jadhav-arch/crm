import { NextRequest, NextResponse } from "next/server";
import { seedFirestore } from "../../../lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Safety check: Dev-only (allows force development flag)
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  
  if (!isDev) {
    return NextResponse.json(
      { error: "Forbidden: Seeding is only permitted in development mode." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { error: "Missing required query parameter: 'uid'." },
      { status: 400 }
    );
  }

  try {
    await seedFirestore(uid);
    return NextResponse.json({
      success: true,
      message: `Database successfully seeded for user ${uid}.`,
    });
  } catch (err: any) {
    console.error("Database seeding failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to seed database." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
// No longer need to import `headers` from 'next/headers'
import { verifyUserToken } from "@/lib/whop";
import { makeChoice } from "@/lib/game-store";

export async function POST(request: Request) {
  try {
    // CORRECTED LINE: Pass `request.headers` directly.
    // This provides the standard Headers object that the function expects.
    const user = await verifyUserToken(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pick }: { pick: 'heads' | 'tails' } = await request.json();
    if (!pick) {
      return NextResponse.json({ error: "Pick is required" }, { status: 400 });
    }

    const success = makeChoice(user.userId, pick);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to record choice. It might be too late." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error making choice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

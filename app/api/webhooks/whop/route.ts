// Webhook for handling successful payments
import { NextResponse } from "next/server";
import { addPlayer, Player } from "@/lib/game-store";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (payload.type === 'payment.succeeded') {
      const { metadata, id: receiptId } = payload.data.object;
      const { userId, username, avatar } = metadata; // Assume we get these from checkout session or fetch them

      if (!userId || !username) {
        return NextResponse.json({ error: "Missing user metadata" }, { status: 400 });
      }

      const player: Player = {
        whopId: userId,
        username: username,
        avatar: avatar || `https://ui-avatars.com/api/?name=${username}`,
        receiptId,
      };

      const success = addPlayer(player);

      if (!success) {
        // Game already started, so we should issue a refund
        console.warn(`Player ${userId} tried to join late. REFUND NEEDED for receipt ${receiptId}`);
        // TODO: Implement refund logic via Whop API
      }
    }
    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
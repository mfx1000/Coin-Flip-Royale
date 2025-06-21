import { NextResponse } from "next/server";
import { whopSdk, verifyUserToken } from "@/lib/whop";
import { getGame } from "@/lib/game-store";

export async function POST(request: Request) {
  try {
    const user = await verifyUserToken(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Invalid user token." }, { status: 401 });
    }

    const game = getGame();

    if (game.phase !== 'waiting') {
      return NextResponse.json({ error: "Sorry, this game has already started. Please wait for the next one." }, { status: 400 });
    }

    const whopUserResponse = await whopSdk.users.getUser({ userId: user.userId });
    if (!whopUserResponse) {
        throw new Error(`Could not fetch user details for ${user.userId}`);
    }
    
    // CORRECTED LINES:
    // Destructure `username` and `profilePicture` directly from the `whopUserResponse` object.
    // The `.publicUser` property does not exist on this object type.
    const { username, profilePicture } = whopUserResponse;

    const checkoutSession = await whopSdk.payments.createCheckoutSession({
      planId: process.env.NEXT_PUBLIC_PLAN_ID!,
      metadata: {
        userId: user.userId,
        username: username,
        avatar: profilePicture?.sourceUrl || `https://ui-avatars.com/api/?name=${username}`,
      },
      redirectUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    return NextResponse.json(checkoutSession);

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
  }
}

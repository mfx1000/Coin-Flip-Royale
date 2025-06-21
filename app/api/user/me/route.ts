import { NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/whop";

/**
 * API route to securely get the current authenticated user's ID from their token.
 */
export async function GET(request: Request) {
    try {
        const user = await verifyUserToken(request.headers);

        // If the token is invalid or the user is not logged in, return null.
        if (!user || !user.userId) {
            return NextResponse.json({ userId: null });
        }

        // On success, return the user's ID.
        return NextResponse.json({ userId: user.userId });

    } catch (error) {
        console.error("Error fetching current user:", error);
        // In case of a server error, protect the client by returning null.
        return NextResponse.json({ userId: null, error: "Internal Server Error" }, { status: 500 });
    }
}

import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";

// Ensure the necessary environment variables are set. This prevents the app from running with a misconfigured state.
if (!process.env.WHOP_API_KEY || !process.env.NEXT_PUBLIC_WHOP_APP_ID) {
  throw new Error("Whop API Key or App ID is not set in environment variables.");
}

/**
 * Initializes the Whop Server-Side SDK.
 * This instance is used for all backend interactions with the Whop API,
 * such as creating checkouts, issuing payouts, and sending notifications.
 */
export const whopSdk = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
});

/**
 * Creates a helper function to verify the JWT sent in the headers of requests from the Whop iframe.
 * This is the primary method of authenticating a user's action on the backend.
 */
export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
});


/**
 * Handles the distribution of the prize pool at the end of a game.
 * It calculates the 70/15/15 split and issues payouts to the winner and the host.
 * The developer's 15% is retained by not being paid out.
 * * @param {string} gameId - The ID of the game for logging and idempotency.
 * @param {string} winnerWhopId - The Whop user ID of the winning player.
 * @param {number} prizePool - The total prize pool collected for the game.
 */
export async function issuePayouts(gameId: string, winnerWhopId: string, prizePool: number) {
  const hostCompanyId = process.env.NEXT_PUBLIC_WHOP_HOST_COMPANY_ID;
  const developerLedgerId = process.env.WHOP_COMPANY_LEDGER_ID; // IMPORTANT: You must get this from your Whop account.

  if (!hostCompanyId || !developerLedgerId) {
    console.error("Payout failed: Host Company ID or Developer Ledger ID is not set in .env");
    return;
  }
  
  // Calculate the prize distribution
  const winnerShare = prizePool * 0.70;
  const hostShare = prizePool * 0.15;
  // The remaining 15% is the developer's share.

  try {
    // 1. Pay the winner
    await whopSdk.payments.payUser({
        amount: parseFloat(winnerShare.toFixed(2)),
        currency: "usd",
        destinationId: winnerWhopId, // The Whop user ID of the winner
        ledgerAccountId: developerLedgerId, // Paying from the app's (developer's) ledger
        notes: `Coin Flip Royale Winner - Game #${gameId}`,
        reason: 'user_to_user',
        idempotenceKey: `payout-winner-${gameId}` // Prevents accidental double payouts
    });
    console.log(`Successfully paid winner ${winnerWhopId} $${winnerShare.toFixed(2)}.`);

    // 2. Pay the community host
    await whopSdk.payments.payUser({
        amount: parseFloat(hostShare.toFixed(2)),
        currency: "usd",
        destinationId: hostCompanyId, // The Company ID of the host
        ledgerAccountId: developerLedgerId,
        notes: `Coin Flip Royale Host Share - Game #${gameId}`,
        reason: 'creator_to_creator',
        idempotenceKey: `payout-host-${gameId}`
    });
    console.log(`Successfully paid host ${hostCompanyId} $${hostShare.toFixed(2)}.`);

  } catch (error) {
      console.error("Failed to issue payouts:", error);
      // TODO: Implement a retry mechanism or alert system for failed payouts
  }
}

/**
 * Sends a push notification to the community where the app is installed.
 * @param {object} params - The notification details.
 * @param {string} params.title - The title of the notification.
 * @param {string} params.message - The body content of the notification.
 */
export async function sendPushNotification({ title, message }: { title: string, message: string }) {
    try {
        await whopSdk.notifications.sendPushNotification({
            experienceId: process.env.WHOP_EXPERIENCE_ID, // You need to decide which experience to notify
            title,
            content: message,
        });
    } catch(error) {
        console.error("Failed to send push notification:", error);
    }
}

// FIXED: Add an empty export at the end of the file.
// This explicitly tells the Next.js compiler that this file is a module,
// which can resolve these specific, stubborn build errors.
export {};

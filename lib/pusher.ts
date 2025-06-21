import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Ensure all necessary Pusher credentials are provided in the environment variables.
// This will stop the server with a clear error if the configuration is missing.
if (
  !process.env.PUSHER_APP_ID ||
  !process.env.NEXT_PUBLIC_PUSHER_KEY ||
  !process.env.PUSHER_SECRET ||
  !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
) {
  throw new Error('Pusher environment variables are not configured correctly.');
}

/**
 * Initializes the Pusher Server SDK.
 * This instance is used on the backend (API routes, server components, game engine)
 * to securely trigger events and send messages to connected clients.
 * The `secret` key ensures that only our server can send these messages.
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// A private variable to hold the client-side singleton instance.
let pusherClientInstance: PusherClient | null = null;

/**
 * Initializes and returns a singleton instance of the Pusher Client SDK.
 * This function should be called on the client-side (in components) only.
 * Using a singleton prevents multiple WebSocket connections from being created,
 * which can happen with React's Strict Mode or component re-renders, saving resources.
 *
 * @returns {PusherClient | null} The Pusher client instance, or null if running on the server.
 */
export const getPusherClient = (): PusherClient | null => {
    // This code only runs in the browser, not on the server.
    if (typeof window !== 'undefined') {
        // If an instance doesn't already exist, create one and store it.
        if (!pusherClientInstance) {
            pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            });
        }
        // Return the existing instance.
        return pusherClientInstance;
    }
    // Return null if this function is somehow called on the server.
    return null;
}
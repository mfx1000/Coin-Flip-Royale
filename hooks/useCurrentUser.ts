import { useState, useEffect } from 'react';

// Defines the structure of the user data we expect from our API
interface UserData {
  userId: string | null;
}

/**
 * A custom React hook to fetch the current user's ID from the backend.
 * It handles its own loading and error states.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserData>({ userId: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define an async function inside the effect to fetch the data
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // This hook calls its own dedicated API route
        const response = await fetch('/api/user/me');

        if (!response.ok) {
          throw new Error('Failed to fetch user session.');
        }

        const data: UserData = await response.json();
        setUser(data);
      } catch (err: any) {
        // In case of an error, ensure the user is set to null
        setUser({ userId: null });
        console.error("useCurrentUser Error:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []); // The empty dependency array [] ensures this effect runs only once

  return { ...user, isLoading };
}

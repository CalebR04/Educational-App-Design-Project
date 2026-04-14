import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Module-level singleton — one per browser tab (sessionStorage is tab-scoped).
let _guestClient: SupabaseClient | null = null;

/** Returns a Supabase client whose auth session lives in sessionStorage.
 *  This means each browser tab gets its own independent anonymous session.
 *  Returns null during SSR. */
export function getGuestClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (_guestClient) return _guestClient;

  _guestClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem:    (key) => sessionStorage.getItem(key),
          setItem:    (key, value) => sessionStorage.setItem(key, value),
          removeItem: (key) => sessionStorage.removeItem(key),
        },
        autoRefreshToken: true,
        persistSession:   true,
        detectSessionInUrl: false,
      },
    }
  );

  return _guestClient;
}

/** Sign in anonymously if no guest session exists yet.
 *  Returns the anonymous user's ID, or null on failure. */
export async function ensureGuestSession(): Promise<string | null> {
  const client = getGuestClient();
  if (!client) return null;

  // Already have a session this tab?
  const { data: { user } } = await client.auth.getUser();
  if (user) return user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) return null;
  return data.user.id;
}

/** Returns the current guest user ID without creating a new session. */
export async function getGuestUserId(): Promise<string | null> {
  const client = getGuestClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

/** Returns the current guest access token for use in API route cleanup calls. */
export async function getGuestAccessToken(): Promise<string | null> {
  const client = getGuestClient();
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session?.access_token ?? null;
}

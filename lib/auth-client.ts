import type { Session } from "@supabase/supabase-js";

export function withAccessToken(
  session: Session | null,
  headers?: HeadersInit
): Headers {
  const nextHeaders = new Headers(headers);

  if (session?.access_token) {
    nextHeaders.set("Authorization", `Bearer ${session.access_token}`);
  }

  return nextHeaders;
}

export async function fetchWithSession(
  session: Session | null,
  input: RequestInfo | URL,
  init?: RequestInit
) {
  return fetch(input, {
    ...init,
    headers: withAccessToken(session, init?.headers),
  });
}

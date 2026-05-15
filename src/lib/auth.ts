/**
 * Shared-password auth. No user accounts — a single SITE_PASSWORD gate.
 * The session cookie stores a SHA-256 hash of the password (with a salt
 * prefix) so middleware can verify it on the edge without a DB lookup.
 */

export const SESSION_COOKIE = "cws_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getSitePassword(): string {
  return process.env.SITE_PASSWORD ?? "";
}

/** Token written into / expected from the session cookie. */
export async function sessionTokenFor(password: string): Promise<string> {
  return sha256Hex(`clockwork-screed::${password}`);
}

export async function expectedSessionToken(): Promise<string> {
  return sessionTokenFor(getSitePassword());
}

export async function isValidSessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedSessionToken();
  return token === expected;
}

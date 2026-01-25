export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifiedAddresses?: string[];
}

/**
 * Get user information from Farcaster FID
 * This would typically connect to the Farcaster Hub API or Neynar API
 */
export async function getFarcasterUser(
  fid: number
): Promise<FarcasterUser | null> {
  try {
    // TODO: Implement actual Farcaster Hub API call or Neynar API
    // For now, return mock data for development
    console.log("Fetching user info for FID:", fid);

    return {
      fid,
      username: `user${fid}`,
      displayName: `User ${fid}`,
      pfpUrl: `https://api.dicebear.com/7.x/avatars/svg?seed=${fid}`,
      custodyAddress: "0x" + fid.toString(16).padStart(40, "0"),
      verifiedAddresses: [],
    };
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}

/**
 * Check if user has required permissions
 */
export async function checkUserPermissions(
  fid: number,
  requiredPermissions: string[] = []
): Promise<boolean> {
  try {
    // TODO: Implement permission checking logic
    // This could involve checking:
    // - User's follows
    // - Channel membership
    // - Token holdings
    // - Custom permissions

    console.log(
      "Checking permissions for FID:",
      fid,
      "Required:",
      requiredPermissions
    );
    return true;
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return false;
  }
}

/**
 * Rate limiting for API interactions
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = identifier;

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, record] of entries) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Generate a secure random state for authentication flows
 */
export function generateAuthState(): string {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    const crypto = require("crypto");
    crypto.randomFillSync(array);
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Create a Sign In with Farcaster URL for miniapp authentication
 */
export function createSignInWithFarcasterUrl(
  domain: string,
  redirectUrl: string,
  state?: string
): string {
  const params = new URLSearchParams({
    domain,
    redirect_uri: redirectUrl,
    ...(state && { state }),
  });

  return `farcaster://sign-in?${params.toString()}`;
}

/**
 * Verify Sign In with Farcaster response
 * TODO: Implement proper verification logic
 */
export async function verifySignInWithFarcaster(
  message: string,
  signature: string,
  nonce: string
): Promise<FarcasterUser | null> {
  try {
    // TODO: Implement actual signature verification
    // This would involve verifying the signature against the message
    // and extracting the user information

    console.log("Verifying Sign In with Farcaster:", {
      message,
      signature,
      nonce,
    });

    // For development, return mock verification
    // In production, use proper cryptographic verification
    return null;
  } catch (error) {
    console.error("Error verifying Sign In with Farcaster:", error);
    return null;
  }
}

/**
 * Parse user FID from various auth contexts
 */
export function parseFidFromContext(context: any): number | null {
  try {
    // Handle different authentication contexts
    if (context.fid) return context.fid;
    if (context.user?.fid) return context.user.fid;
    if (context.profile?.fid) return context.profile.fid;

    return null;
  } catch (error) {
    console.error("Error parsing FID from context:", error);
    return null;
  }
}

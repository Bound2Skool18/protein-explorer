// A minimal in-memory sliding-window rate limiter for the chat route.
//
// Known limitation, stated plainly: Vercel serverless functions aren't
// guaranteed to be one persistent process, so this state doesn't survive a
// cold start and isn't shared across concurrent instances under real
// traffic. It's a first line of defense against the trivial case (a
// script hammering the endpoint in a tight loop, which mostly lands on the
// same warm instance) -- not a substitute for a shared store like Upstash
// Redis / Vercel KV, which is the real fix if this app ever gets enough
// traffic for that gap to matter.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const requestLog = new Map<string, number[]>();

export function checkRateLimit(clientId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (requestLog.get(clientId) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterMs: timestamps[0] + WINDOW_MS - now };
  }

  timestamps.push(now);
  requestLog.set(clientId, timestamps);

  // Bound the map itself so a flood of distinct fake IPs can't grow this
  // forever between garbage collections -- evict the oldest-looking entry.
  if (requestLog.size > 5000) {
    const oldestKey = requestLog.keys().next().value;
    if (oldestKey) requestLog.delete(oldestKey);
  }

  return { allowed: true, retryAfterMs: 0 };
}

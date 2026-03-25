const rateMap = new Map<string, { count: number; expiresAt: number }>();

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (entry.expiresAt < now) rateMap.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.expiresAt < now) {
    rateMap.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxAttempts - entry.count };
}

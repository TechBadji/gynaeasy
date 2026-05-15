const store = new Map<string, { count: number; resetAt: number }>();

// Purge entries that have expired to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
        if (now > entry.resetAt) store.delete(key);
    });
}, 10 * 60 * 1000);

/**
 * Returns true if the request is within the allowed rate, false if it should be blocked.
 * @param key      Unique identifier (e.g. "reset:1.2.3.4" or "sms:userId")
 * @param max      Maximum number of requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= max) return false;
    entry.count++;
    return true;
}

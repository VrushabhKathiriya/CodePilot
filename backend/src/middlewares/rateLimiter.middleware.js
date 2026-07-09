import ApiError from "../utils/ApiError.js";

const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max      = 100,
    message  = "Too many requests. Please try again later.",
} = {}) => {
    const store = new Map();

    // CLEANUP — remove stale entries every window
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt <= now) store.delete(key);
        }
    }, windowMs);

    return (req, res, next) => {
        const key = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
        const now = Date.now();

        const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

        if (entry.resetAt <= now) {
            entry.count   = 0;
            entry.resetAt = now + windowMs;
        }

        entry.count++;
        store.set(key, entry);

        res.setHeader("X-RateLimit-Limit",     max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
        res.setHeader("X-RateLimit-Reset",     Math.ceil(entry.resetAt / 1000));

        if (entry.count > max) {
            res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
            throw new ApiError(429, message);
        }

        next();
    };
};

// AUTH — 20 requests per 15 minutes
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max:      20,
    message:  "Too many authentication attempts. Please wait 15 minutes before trying again.",
});

// OTP RESEND — 5 requests per hour
export const otpLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max:      5,
    message:  "Too many OTP requests. Please wait 1 hour before requesting another OTP.",
});

// SYNC — 10 requests per 5 minutes
export const syncLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max:      10,
    message:  "Too many sync requests. Please wait a few minutes before syncing again.",
});

// Simple in-memory rate limiter: max requests per user per time window.
// Good enough for a learning project / small deployment.
// For production with multiple server instances, replace with a Redis-backed limiter.

const requestLog = new Map(); // userId -> array of timestamps
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function chatRateLimiter(req, res, next) {
  const userId = String(req.userId);
  const now = Date.now();
  const timestamps = (requestLog.get(userId) || []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= LIMIT) {
    return res.status(429).json({ error: `Rate limit reached. Max ${LIMIT} messages per hour. Try again later.` });
  }

  timestamps.push(now);
  requestLog.set(userId, timestamps);
  next();
}

module.exports = chatRateLimiter;

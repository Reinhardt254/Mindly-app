// Dev smoke test against a running API: node scripts/smoke.mjs [baseUrl] [webhookSecret]
const base = process.argv[2] ?? "http://localhost:3000";
const webhookSecret = process.argv[3] ?? "dev-webhook-secret";
let cookie = "";

async function call(method, path, body, headers = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json", origin: "moodly://", ...(cookie ? { cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map((c) => c.split(";")[0]).join("; ");
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  console.log(method, path, res.status, JSON.stringify(data)?.slice(0, 220));
  return data;
}

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

await call("GET", "/health");
await call("GET", "/me");
const signup = await call("POST", "/api/auth/sign-up/email", {
  email: `t${Date.now()}@example.com`,
  password: "password123",
  name: "Tester",
});
await call("GET", "/me");
await call("GET", "/affirmations/categories");
await call("GET", `/affirmations/daily?date=${today}`);
await call("PUT", "/favorites/aff_001");
await call("PUT", "/favorites/aff_001");
await call("GET", "/favorites");
for (let i = 0; i < 6; i++) await call("POST", "/custom-affirmations", { text: `custom ${i}` });
await call("POST", "/moods", { mood: "anxious", date: today });
await call("GET", "/moods/insights?range=week");
await call("POST", "/sync/import", {
  activity: [{ date: "2026-01-01", viewed: 3 }, { date: yesterday, viewed: 2 }],
  favoriteAffirmationIds: ["aff_002", "unknown"],
});
await call("POST", "/activity/checkin", { date: today, viewed: 1 });
await call("GET", `/activity/streak?date=${today}`);
const event = {
  type: "INITIAL_PURCHASE",
  app_user_id: signup?.user?.id,
  entitlement_ids: ["premium"],
  expiration_at_ms: Date.now() + 86400000,
};
await call("POST", "/webhooks/revenuecat", { event }, { authorization: "wrong" });
await call("POST", "/webhooks/revenuecat", { event }, { authorization: `Bearer ${webhookSecret}` });
await call("GET", "/me");
await call("POST", "/custom-affirmations", { text: "custom premium" });
await call("GET", "/moods/insights?range=week&tz=-180");
await call("GET", "/ai/usage");
await call("POST", "/ai/affirmations", { situation: "I have an interview tomorrow" });

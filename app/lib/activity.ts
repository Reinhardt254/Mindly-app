import { api } from "./api";
import { localDate } from "./dates";
import { queryClient } from "./queryClient";

type Counter = "viewed" | "liked" | "shared" | "practiceSessions";

let pending: Record<Counter, number> = { viewed: 0, liked: 0, shared: 0, practiceSessions: 0 };
let timer: ReturnType<typeof setTimeout> | null = null;

/** Batches activity counters and sends them as one check-in a few seconds later. */
export function trackActivity(counter: Counter, amount = 1) {
  pending[counter] += amount;
  if (!timer) timer = setTimeout(flushActivity, 4000);
}

export async function flushActivity() {
  if (timer) clearTimeout(timer);
  timer = null;
  const body = pending;
  pending = { viewed: 0, liked: 0, shared: 0, practiceSessions: 0 };
  try {
    await api("/activity/checkin", { method: "POST", body: { date: localDate(), ...body } });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  } catch {
    (Object.keys(body) as Counter[]).forEach((k) => (pending[k] += body[k]));
  }
}

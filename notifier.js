// Delivers reminders the tutor scheduled.
// On a Mac running the server locally: native notifications. When hosted: the page polls and shows them itself.
import { execFile } from "node:child_process";
import { listIds, forLearner } from "./learner.js";

const CHECK_EVERY = 30_000;
export const NATIVE = (process.env.NOTIFY ?? (process.platform === "darwin" ? "macos" : "page")) === "macos";

function notify(title, body) {
  const q = s => JSON.stringify(String(s)); // AppleScript string literal
  execFile("osascript", ["-e", `display notification ${q(body)} with title ${q(title)} sound name "Tink"`], err => {
    if (err) console.error("notification failed:", err.message);
  });
}

export function startNotifier() {
  if (!NATIVE) return;
  const tick = () => {
    for (const id of listIds()) {
      const learner = forLearner(id);
      if (!learner.remindersOn()) continue;
      for (const r of learner.takeDueReminders()) {
        notify("vocab_", r.message || `review: ${r.words.join(", ")}`);
        console.log(`[reminder sent] ${r.words.join(", ")}`);
      }
    }
  };
  tick();
  setInterval(tick, CHECK_EVERY).unref();
}

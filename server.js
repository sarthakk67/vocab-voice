// Static files + one endpoint per learner turn. No framework.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { forLearner, validId } from "./learner.js";
import { startNotifier, NATIVE } from "./notifier.js";
import { findWord } from "./words.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4480;
const DEMO = process.env.DEMO === "1";
const REPO_URL = process.env.REPO_URL || "";
// Shared-link guardrails: the whole server and each visitor get a daily budget of tutor calls.
const DAILY_CAP = Number(process.env.TUTOR_DAILY_CAP) || 400;
const VISITOR_CAP = Number(process.env.TUTOR_VISITOR_CAP) || 80;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const PUBLIC = new Set(["/index.html", "/words.js"]);

// Without credentials the page still works in its scripted mode.
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.GEMINI_API_KEY);
const agent = hasKey ? await import("./agent.js") : null;
startNotifier();

const usage = { day: "", total: 0, byVisitor: new Map() };
function spend(id) {
  const day = new Date().toISOString().slice(0, 10);
  if (usage.day !== day) Object.assign(usage, { day, total: 0, byVisitor: new Map() });
  const mine = usage.byVisitor.get(id) ?? 0;
  if (usage.total >= DAILY_CAP || mine >= VISITOR_CAP) return false;
  usage.total++;
  usage.byVisitor.set(id, mine + 1);
  return true;
}

const send = (res, code, body, type = "application/json", headers = {}) => {
  res.writeHead(code, { "content-type": type, ...headers });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

// Each browser gets its own learner file via a random id cookie.
function visitor(req) {
  const m = /(?:^|;\s*)vid=([a-z0-9]{16})/.exec(req.headers.cookie || "");
  if (m && validId(m[1])) return { id: m[1], cookie: null };
  const id = crypto.randomBytes(8).toString("hex");
  return { id, cookie: `vid=${id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax` };
}

const EVENTS = new Set(["start", "answer", "skip"]);
function cleanTurn(t) {
  if (!t || !EVENTS.has(t.event)) throw new Error("bad event");
  const str = (s, n) => String(s ?? "").slice(0, n);
  return {
    event: t.event,
    level: ["easy", "medium", "hard"].includes(t.level) ? t.level : undefined,
    word: t.word && findWord(t.word) ? t.word : null,
    heard: (Array.isArray(t.heard) ? t.heard : []).slice(0, 5).map(h => str(h, 120)),
    local: ["correct", "close", "synonym", "missed", "skipped"].includes(t.local) ? t.local : "missed",
    hints: Math.min(Number(t.hints) || 0, 2),
    typed: Boolean(t.typed),
    roundSize: 10,
    session: (Array.isArray(t.session) ? t.session : []).slice(-20)
      .filter(s => findWord(s?.w)).map(s => ({ w: s.w, verdict: str(s.verdict, 10) })),
  };
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const v = visitor(req);
  const set = v.cookie ? { "set-cookie": v.cookie } : {};
  const learner = forLearner(v.id);
  try {
    if (url.pathname === "/api/status")
      return send(res, 200, {
        agent: Boolean(agent), model: agent?.MODEL, reason: agent ? undefined : "no API key",
        demo: DEMO, repo: REPO_URL, nativeReminders: NATIVE,
      }, undefined, set);

    if (url.pathname === "/api/reminders") {
      if (req.method === "POST") learner.setRemindersOn(url.searchParams.get("on") === "1");
      // Hosted: the page collects due reminders itself and shows them.
      const due = !NATIVE && url.searchParams.get("take") === "1" && learner.remindersOn() ? learner.takeDueReminders() : [];
      return send(res, 200, { on: learner.remindersOn(), pending: learner.pendingReminders(), due }, undefined, set);
    }

    if (url.pathname === "/api/turn" && req.method === "POST") {
      if (!agent) return send(res, 503, { error: "agent disabled" }, undefined, set);
      let raw = "";
      for await (const chunk of req) { raw += chunk; if (raw.length > 20_000) return send(res, 413, { error: "too large" }); }
      if (!spend(v.id)) return send(res, 429, { error: "demo limit reached for today" }, undefined, set);
      const t0 = Date.now();
      const out = await agent.runTurn(cleanTurn(JSON.parse(raw)), learner);
      console.log(`turn ${Date.now() - t0}ms  ${v.id.slice(0, 4)}  ${out.trace.join("  ")}`);
      return send(res, 200, out, undefined, set);
    }

    const file = url.pathname === "/" ? "/index.html" : url.pathname;
    if (!PUBLIC.has(file)) return send(res, 404, "not found", "text/plain");
    send(res, 200, await fs.readFile(path.join(ROOT, file), "utf8"), TYPES[path.extname(file)], set);
  } catch (err) {
    // API errors carry a readable message (bad key, no credit, rate limit); keep the log to one line.
    const msg = err?.error?.error?.message || err.message; // (Gemini errors put the reason in err.message)
    console.error(`error: ${err.status ?? ""} ${msg}`);
    send(res, 500, { error: msg }, undefined, set);
  }
}).listen(PORT, () => console.log(`vocab_ on http://localhost:${PORT}  (agent: ${agent ? agent.MODEL : "off"}${DEMO ? ", demo" : ""})`));

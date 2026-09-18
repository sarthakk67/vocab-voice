// Learner memory: one JSON file per visitor. Leitner-style boxes decide when a word is due again.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LEVELS } from "./words.js";

const DIR = process.env.VOCAB_DATA || path.join(path.dirname(fileURLToPath(import.meta.url)), "data", "learners");
const MIN = 60_000, DAY = 86_400_000;
const INTERVAL = [0, 5 * MIN, DAY, 3 * DAY, 7 * DAY, 21 * DAY]; // by box 0..5

const cache = new Map();

export const validId = id => typeof id === "string" && /^[a-z0-9]{16}$/.test(id);

export function listIds() {
  try { return fs.readdirSync(DIR).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)).filter(validId); }
  catch { return []; }
}

export function forLearner(id) {
  if (!validId(id)) throw new Error("bad learner id");
  if (!cache.has(id)) cache.set(id, makeLearner(path.join(DIR, `${id}.json`)));
  return cache.get(id);
}

function makeLearner(file) {
  let state;
  try { state = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { state = { level: "medium", words: {}, levelChanges: [], reminders: [], remindersOn: true }; }

  const save = () => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(state, null, 2));
  };
  const entry = w => (state.words[w] ??= { box: 0, seen: 0, right: 0, missed: 0, lastSeen: null, due: 0, history: [], notes: [] });
  const reminders = () => (state.reminders ??= []);
  const pendingReminders = () => reminders().filter(r => !r.sent).sort((a, b) => a.at - b.at);

  return {
    getLevel: () => state.level,
    setLevel(level, reason, by) {
      if (!LEVELS[level] || level === state.level) return;
      state.level = level;
      state.levelChanges.push({ level, reason, by, at: new Date().toISOString() });
      save();
    },

    record(w, verdict) {
      const e = entry(w), now = Date.now();
      e.seen++;
      e.lastSeen = new Date(now).toISOString();
      if (verdict === "correct" || verdict === "close") { e.right++; e.box = Math.min(e.box + 1, 5); }
      else if (verdict === "synonym") e.box = Math.max(e.box, 1);
      else { e.missed++; e.box = 1; }
      e.due = now + INTERVAL[e.box];
      e.history = [...e.history, verdict].slice(-10);
      save();
    },

    addNote(w, note) {
      const e = entry(w);
      e.notes = [...e.notes, note].slice(-5);
      save();
    },

    wordHistory: w => state.words[w] ?? null,

    // Compact snapshot handed to the model each turn.
    snapshot(sessionWords) {
      const now = Date.now();
      const seen = Object.entries(state.words);
      const fmt = ([w, e]) => `${w} (${e.right}/${e.seen} right${e.notes.length ? `; note: ${e.notes.at(-1)}` : ""})`;
      return {
        level: state.level,
        due: seen.filter(([w, e]) => e.due <= now && !sessionWords.includes(w)).map(fmt),
        weak: seen.filter(([, e]) => e.missed > 0 && e.box <= 1).map(fmt),
        unseenAtLevel: LEVELS[state.level].map(x => x.w).filter(w => !state.words[w]),
        totalSeen: seen.length,
        recentLevelChanges: state.levelChanges.slice(-3),
      };
    },

    // Reminders the tutor schedules for missed words; the notifier (macOS) or the page delivers them.
    remindersOn: () => state.remindersOn !== false,
    setRemindersOn(on) { state.remindersOn = on; save(); },
    addReminder(minutes, words, message) {
      const r = { id: Date.now().toString(36), at: Date.now() + minutes * MIN, words, message, sent: false };
      reminders().push(r);
      save();
      return r;
    },
    pendingReminders,
    takeDueReminders() {
      const due = pendingReminders().filter(r => r.at <= Date.now());
      due.forEach(r => { r.sent = true; });
      if (due.length) { state.reminders = reminders().slice(-50); save(); }
      return due;
    },
  };
}

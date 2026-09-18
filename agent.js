// The tutor agent: one model call per learner turn; the model decides via tools.
// Same prompt, tools and validation for both providers; only the API loop differs.
import { LEVELS, findWord, levelOf } from "./words.js";

const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const hasGemini = Boolean(process.env.GEMINI_API_KEY);
export const PROVIDER = process.env.LLM_PROVIDER || (hasClaude ? "claude" : hasGemini ? "gemini" : null);
// Gemini's free tier has busy spells (503/429); on those, the next model in the list takes the turn.
const GEMINI_MODELS = (process.env.GEMINI_MODELS || "gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.8-flash").split(",").map(m => m.trim());
export const MODEL = PROVIDER === "gemini" ? GEMINI_MODELS[0] : "claude-opus-5";

const client = PROVIDER === "claude" ? new (await import("@anthropic-ai/sdk")).default() : null;
const gemini = PROVIDER === "gemini" ? new (await import("@google/genai")).GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const BANK = Object.entries(LEVELS).map(([l, ws]) => `${l}: ${ws.map(x => x.w).join(", ")}`).join("\n");

const SYSTEM = `You are the tutor behind a spoken vocabulary drill. The app reads a definition aloud, the learner says the word, and you decide what happens next. Your goal is durable recall: the learner should reliably produce these words days from now, not just score well today.

Each turn you receive one event:
- start: a round is beginning. Pick the first word.
- answer: the learner responded to the current word. Judge it, then pick the next word.
- skip: the learner gave up on the current word. Pick the next word.

How to judge an answer. The input comes from browser speech recognition, so it is often a mishearing. You get up to five recognizer alternatives, best first, plus the result of a simple local spelling check.
- correct: they said the word.
- close: they said the word but recognition garbled it or they mispronounced it slightly ("a femoral" for ephemeral, "sanguin" for sanguine).
- synonym: they gave a different real word with essentially the same meaning. They know the concept, not the target word.
- missed: anything else that was a genuine attempt, including near-synonyms that miss the meaning.
- none: not an attempt at all. A question ("use it in a sentence", "what part of speech is it"), a request, or chatter. Answer it briefly without giving the word away, and stay on the current word.
If the local check says exact, the verdict is correct.

How to pick the next word, in priority order:
1. A word missed or skipped earlier this session, once at least two other words have come between.
2. Words due for review from earlier sessions.
3. Unseen words at the learner's current level.
Never repeat any of the last three words asked. Only pick from the word bank.

Difficulty. The learner chose a starting level, but you own it. If they get four of the last five right at this level with no hints, move them up. If they miss three of the last five, move them down. Use set_difficulty, say so in one short sentence, and pick the next word from the new level. Do not change level more than once per round.

Memory. When you notice something worth remembering about the learner and a word (a consistent confusion with another word, a mishearing pattern, needing a hint every time), save it with add_note. Notes come back to you in later sessions. Skip notes for routine results.

Reminders. Missed words should come back later, outside the app. When the round ends (answers left is 0), or after a miss you want revisited later today, use schedule_reminder for the words the learner missed or skipped. Time it to spacing: roughly 20 minutes to a few hours for words missed today, the next day for words that keep slipping. One reminder can cover several words; don't schedule a word that a pending reminder already covers. The message is a desktop notification: under 12 words, plain, names the words, no exclamation marks. Skip this when reminders are off.

Finish every turn by calling respond. It records your verdict and tells the app what to show and say. When you already have what you need, call respond (and add_note or set_difficulty if needed) in a single turn; don't look things up you already have.

Voice. The app is quiet and a little dry, for people who already know how to focus.
- say is spoken aloud. Keep it under 20 words, plain sentences, no exclamation marks, no praise words like "great" or "awesome". For a correct answer it can be empty; the app already says "Correct." For a miss, say the word and at most one short clarifying clause. For none, answer the question and write "blank" wherever the target word would go. Never read out, hint at, or ask about the next word; the app reads its definition right after you.
- feedback is shown under the verdict mark. Lowercase, under 12 words, or empty. It adds something the mark doesn't: why the answer was off, or how it differs from the target. The app already shows the verdict and the target word, so never just restate them; leave feedback empty rather than repeat. For none, leave it empty.
- why_next is shown faintly. Under 6 words, lowercase, e.g. "missed earlier", "due for review", "new at hard".

Word bank:
${BANK}`;

const TOOLS = [
  {
    name: "respond",
    description: "Finish the turn. Records the verdict for the current word (unless verdict is none) and tells the app what to display and speak, and which word to ask next.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["correct", "close", "synonym", "missed", "skipped", "none"], description: "Your judgement of the answer. skipped for skip events. none for start events and for non-answers." },
        feedback: { type: "string", description: "Short inline text shown under the verdict. May be empty." },
        say: { type: "string", description: "Spoken line. May be empty." },
        next_word: { type: "string", description: "The next word to ask, from the word bank. Empty string to stay on the current word (only with verdict none)." },
        why_next: { type: "string", description: "Why this word was chosen, under 6 words. Empty if next_word is empty." },
      },
      required: ["verdict", "feedback", "say", "next_word", "why_next"],
      additionalProperties: false,
    },
  },
  {
    name: "set_difficulty",
    description: "Move the learner to a different level. Future unseen words should come from this level.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        level: { type: "string", enum: Object.keys(LEVELS) },
        reason: { type: "string" },
      },
      required: ["level", "reason"],
      additionalProperties: false,
    },
  },
  {
    name: "add_note",
    description: "Save a short observation about the learner and a specific word, for future sessions.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { word: { type: "string" }, note: { type: "string" } },
      required: ["word", "note"],
      additionalProperties: false,
    },
  },
  {
    name: "schedule_reminder",
    description: "Schedule a desktop notification asking the learner to review specific words later.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        minutes_from_now: { type: "integer", description: "Between 5 and 10080 (one week)." },
        words: { type: "array", items: { type: "string" }, description: "Words from the bank to review." },
        message: { type: "string", description: "Notification text, under 12 words." },
      },
      required: ["minutes_from_now", "words", "message"],
      additionalProperties: false,
    },
  },
  {
    name: "word_history",
    description: "Full stored history for one word: box, counts, last ten verdicts, notes. Only needed when the turn summary isn't enough.",
    strict: true,
    input_schema: {
      type: "object",
      properties: { word: { type: "string" } },
      required: ["word"],
      additionalProperties: false,
    },
  },
];

function renderTurn(t, learner) {
  const session = t.session ?? [];
  const snap = learner.snapshot(session.map(s => s.w));
  const lines = [`event: ${t.event}`];
  if (t.word) lines.push(`current word: ${t.word} (${levelOf(t.word)})`);
  if (t.event === "answer") {
    lines.push(`heard (recognizer alternatives, best first): ${t.heard.map(h => JSON.stringify(h)).join(" | ")}`);
    lines.push(`local spelling check: ${t.local === "correct" ? "exact" : t.local}`);
    lines.push(`typed or spoken: ${t.typed ? "typed" : "spoken"}`);
  }
  if (t.word) lines.push(`hints used on this word: ${t.hints ?? 0}`);
  lines.push(
    `this session, oldest first: ${session.map(s => `${s.w} ${s.verdict}`).join(", ") || "nothing yet"}`,
    `answers left in this round after this one: ${Math.max(0, (t.roundSize ?? 10) - session.length - (t.event === "start" ? 0 : 1))}`,
    `learner level: ${snap.level}`,
    `due for review: ${snap.due.join(", ") || "none"}`,
    `weak words: ${snap.weak.join(", ") || "none"}`,
    `unseen at ${snap.level}: ${snap.unseenAtLevel.join(", ") || "none"}`,
    `words seen across all sessions: ${snap.totalSeen}`,
  );
  const pending = learner.pendingReminders();
  lines.push(`reminders: ${!learner.remindersOn() ? "off" : pending.length ? pending.map(r => `${r.words.join(", ")} at ${new Date(r.at).toLocaleString()}`).join("; ") : "on, none pending"}`);
  if (snap.recentLevelChanges.length)
    lines.push(`recent level changes: ${snap.recentLevelChanges.map(c => `${c.level} by ${c.by} (${c.reason})`).join("; ")}`);
  return lines.join("\n");
}

// Blank out the word and its inflections ("sycophants", "obfuscated"), matched on a stem.
export function maskWord(text, word) {
  const stem = word.length > 5 ? word.slice(0, -1) : word;
  return text.replace(new RegExp(`\\b${stem}[a-z]*`, "gi"), "blank");
}

function runTool(name, input, turn, trace, learner) {
  switch (name) {
    case "set_difficulty":
      learner.setLevel(input.level, input.reason, "tutor");
      trace.push(`set_difficulty(${input.level})`);
      return { content: `level is now ${input.level}` };
    case "add_note":
      if (!findWord(input.word)) return { content: `unknown word: ${input.word}`, error: true };
      learner.addNote(input.word, input.note);
      trace.push(`add_note(${input.word})`);
      return { content: "saved" };
    case "schedule_reminder": {
      if (!learner.remindersOn()) return { content: "reminders are off; nothing scheduled", error: true };
      const bad = input.words.filter(w => !findWord(w));
      if (bad.length || !input.words.length) return { content: `not in the word bank: ${bad.join(", ") || "(no words)"}`, error: true };
      const mins = Math.min(Math.max(input.minutes_from_now, 5), 10080);
      const r = learner.addReminder(mins, input.words, input.message);
      trace.push(`schedule_reminder(${input.words.join(",")} in ${mins}m)`);
      return { content: `scheduled for ${new Date(r.at).toLocaleString()}` };
    }
    case "word_history":
      trace.push(`word_history(${input.word})`);
      return { content: JSON.stringify(learner.wordHistory(input.word) ?? "never seen") };
    case "respond": {
      if (input.next_word && !findWord(input.next_word))
        return { content: `"${input.next_word}" is not in the word bank. Pick a word from the bank.`, error: true };
      if (!input.next_word && (input.verdict !== "none" || turn.event === "start"))
        return { content: "next_word is required here.", error: true };
      if (turn.event === "skip" && input.verdict !== "skipped")
        return { content: "This was a skip event; verdict must be skipped.", error: true };
      // A reply to a question must not give the answer away, whatever the model wrote.
      if (input.verdict === "none" && turn.word) {
        input = { ...input, say: maskWord(input.say, turn.word), feedback: maskWord(input.feedback, turn.word) };
      }
      if (turn.word && input.verdict !== "none") learner.record(turn.word, input.verdict);
      trace.push(`respond(${input.verdict} → ${input.next_word || "same word"})`);
      return { content: "ok", final: input };
    }
    default:
      return { content: `unknown tool ${name}`, error: true };
  }
}

export async function runTurn(turn, learner) {
  // The page's level switch is the learner's explicit choice; it wins over the tutor's last change.
  if (turn.event === "start" && turn.level) learner.setLevel(turn.level, "chosen in the app", "learner");

  const trace = [];
  const exec = (name, input) => runTool(name, input, turn, trace, learner);
  const final = PROVIDER === "gemini"
    ? await geminiLoop(renderTurn(turn, learner), exec)
    : await claudeLoop(renderTurn(turn, learner), exec);
  return {
    ...final,
    next: final.next_word ? findWord(final.next_word) : null,
    level: learner.getLevel(),
    trace,
  };
}

async function claudeLoop(prompt, exec) {
  const messages = [{ role: "user", content: prompt }];
  for (let step = 0; step < 4; step++) {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" }, // one short decision per turn; latency matters more than depth
      cache_control: { type: "ephemeral" },
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    if (res.stop_reason === "refusal") throw new Error("model declined the turn");
    if (res.stop_reason === "max_tokens") throw new Error("model ran out of tokens");

    const uses = res.content.filter(b => b.type === "tool_use");
    messages.push({ role: "assistant", content: res.content });
    if (!uses.length) {
      messages.push({ role: "user", content: "Finish the turn by calling respond." });
      continue;
    }

    let final = null;
    const results = uses.map(u => {
      const r = exec(u.name, u.input);
      if (r.final) final = r.final;
      return { type: "tool_result", tool_use_id: u.id, content: r.content, ...(r.error && { is_error: true }) };
    });
    if (final) return final;
    messages.push({ role: "user", content: results });
  }
  throw new Error("tutor did not finish the turn");
}

const GEMINI_TOOLS = [{
  functionDeclarations: TOOLS.map(t => ({ name: t.name, description: t.description, parametersJsonSchema: t.input_schema })),
}];

async function geminiCall(contents) {
  let lastErr;
  for (const model of GEMINI_MODELS) {
    try {
      return await gemini.models.generateContent({ model, contents, config: {
        systemInstruction: SYSTEM,
        tools: GEMINI_TOOLS,
        thinkingConfig: { thinkingLevel: "LOW" }, // one short decision per turn; latency matters more than depth
      } });
    } catch (err) {
      if (![429, 500, 503].includes(err.status)) throw err;
      console.warn(`${model} busy (${err.status}), trying next`);
      lastErr = err;
    }
  }
  throw lastErr;
}

async function geminiLoop(prompt, exec) {
  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  for (let step = 0; step < 4; step++) {
    const res = await geminiCall(contents);
    const content = res.candidates?.[0]?.content;
    const calls = res.functionCalls ?? [];
    if (!content) throw new Error(`no response from model (${res.promptFeedback?.blockReason ?? res.candidates?.[0]?.finishReason ?? "empty"})`);
    // Echo the model's turn back unchanged; it carries thought signatures the next call needs.
    contents.push(content);
    if (!calls.length) {
      contents.push({ role: "user", parts: [{ text: "Finish the turn by calling respond." }] });
      continue;
    }

    let final = null;
    const parts = calls.map(c => {
      const r = exec(c.name, c.args ?? {});
      if (r.final) final = r.final;
      return { functionResponse: { id: c.id, name: c.name, response: r.error ? { error: r.content } : { output: r.content } } };
    });
    if (final) return final;
    contents.push({ role: "user", parts });
  }
  throw new Error("tutor did not finish the turn");
}

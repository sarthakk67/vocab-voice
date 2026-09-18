# vocab_

A spoken vocabulary drill with an LLM tutor deciding what happens next. The page reads a definition aloud, you say the word, and the tutor judges your answer, picks the next word, adjusts difficulty, and schedules reminders for the words you missed.

**Live demo:** https://vocab-voice.onrender.com · **90-second walkthrough:** _link_
Voice needs Chrome or Edge. Press `t` to type instead. The demo is on a free tier, so if nobody has used it for a while, the first load takes up to a minute.

## What the agent actually decides

Each answer is one model call with five tools. The live demo runs on Gemini (`gemini-3.5-flash`, low thinking), and the same prompt and tools also run on Claude (`claude-opus-5`, set `LLM_PROVIDER=claude`):

| tool | decision |
|---|---|
| `respond` | Verdict: correct / close / synonym / missed / skipped, or *none* for questions like "use it in a sentence". Also what to say and show, and the next word. |
| `set_difficulty` | Moves the learner between easy, medium and hard based on recent answers. |
| `schedule_reminder` | Which missed words to bring back, and when (minutes for today's misses, the next day for words that keep slipping). |
| `add_note` | Saves observations that come back in later sessions, e.g. "hears torpid as torpedo". |
| `word_history` | Reads one word's full record when the turn summary isn't enough. |

Before this version the same app was a scripted loop: a random word order, spelling-only scoring and fixed feedback lines. That version is still the fallback when the API is unavailable.

## Design choices

- **Deterministic first, model second.** Exact and near-spelling answers are scored in the browser instantly. The tutor only picks the next word while "Correct." is spoken. Only answers that don't match wait on the model. This keeps most turns feeling immediate.
- **The model can't pick outside the word bank.** Tool calls are validated on the server. An unknown word or a wrong verdict for a skip goes back to the model as a tool error, and it has to try again.
- **Hard rules are enforced in code, not only in the prompt.** Testing showed the model sometimes used the target word when asked for an example sentence, which gives the answer away. The server now blanks the word and its forms out of any reply to a question.
- **Busy models don't break the demo.** On a 429/503 from Gemini's free tier, the turn retries on the next model in `GEMINI_MODELS`.
- **Learner memory is plain data.** A per-browser JSON file holds spaced-repetition boxes (Leitner), notes and reminders. The model gets a compact snapshot each turn instead of a growing chat history.
- **Guardrails for a shared link.** Each browser gets its own learner. There's a daily cap on tutor calls in total and per visitor, and past the cap the page falls back to scripted mode. Input is size-limited and validated.
- **Graceful degradation.** No key, no credit, a rate limit or a network failure all switch the page to scripted mode and say why.

## Limits

- It's a prototype with 60 words, one tutor prompt, and no evaluation set yet for judging quality.
- Speech recognition is the browser's Web Speech API. In Chrome, audio is processed by Google.
- On the hosted demo, learner data lives on the server's disk and may reset on redeploy. Reminders show up in the open tab. Native desktop notifications only work when running locally on macOS.

## Run locally

```bash
npm install
echo "GEMINI_API_KEY=..." > .env      # or ANTHROPIC_API_KEY=...
npm start            # http://localhost:4480
```

| env | default | |
|---|---|---|
| `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` | none | With neither, the page runs in scripted mode. |
| `LLM_PROVIDER` | whichever key is set (Claude if both) | `gemini` or `claude`. |
| `GEMINI_MODELS` | `gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.8-flash` | Tried in order when one is busy. |
| `DEMO` | off | Shows the demo banner. |
| `NOTIFY` | `macos` on a Mac, else `page` | Where reminders are delivered. |
| `TUTOR_DAILY_CAP` / `TUTOR_VISITOR_CAP` | 400 / 80 | Tutor calls per day. |
| `REPO_URL` | none | Adds a "source" link to the banner. |

## Files

`agent.js` has the tutor prompt, tools, and the Claude and Gemini loops. `learner.js` holds memory per visitor. `notifier.js` delivers macOS reminders. `server.js` has the HTTP server, visitor cookie and caps. `index.html` is the whole front end. `words.js` is the word bank.

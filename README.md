# vocab_

A spoken vocabulary drill with a Claude tutor deciding what happens next. The page reads a definition aloud, you say the word, and the tutor judges your answer, picks the next word, adjusts difficulty, and schedules reminders for the words you missed.

**Live demo:** https://vocab-voice.onrender.com · **90-second walkthrough:** _link_
Voice needs Chrome or Edge. Press `t` to type instead. The demo is on a free tier, so if nobody has used it for a while, the first load takes up to a minute.

## What the agent actually decides

Each answer is one Claude call (`claude-opus-5`, low effort) with five tools:

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
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
npm start            # http://localhost:4480
```

| env | default | |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Without it, the page runs in scripted mode. |
| `DEMO` | off | Shows the demo banner. |
| `NOTIFY` | `macos` on a Mac, else `page` | Where reminders are delivered. |
| `TUTOR_DAILY_CAP` / `TUTOR_VISITOR_CAP` | 400 / 80 | Tutor calls per day. |
| `REPO_URL` | none | Adds a "source" link to the banner. |

## Files

`agent.js` has the tutor prompt, tools and loop. `learner.js` holds memory per visitor. `notifier.js` delivers macOS reminders. `server.js` has the HTTP server, visitor cookie and caps. `index.html` is the whole front end. `words.js` is the word bank.

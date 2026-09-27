// Sarvam speech: Saarika/Saaras speech-to-text and Bulbul text-to-speech.
// Optional — without SARVAM_API_KEY the page uses the browser's own Web Speech API,
// which only Chrome and Edge support. Sarvam makes voice work in Safari and Firefox too.
//
// Wire shapes follow the same endpoints used in the author's other Sarvam project
// (checked against docs.sarvam.ai on 2026-09-15); adjust here if their API moves on.

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";
const LANG = process.env.SARVAM_LANGUAGE || "en-IN";
const STT_MODEL = process.env.SARVAM_STT_MODEL || "saarika:v2.5";
const TTS_MODEL = process.env.SARVAM_TTS_MODEL || "bulbul:v3";
const SPEAKER = process.env.SARVAM_TTS_SPEAKER || "kavya";

export const configured = () => Boolean(process.env.SARVAM_API_KEY);

const key = () => ({ "API-Subscription-Key": process.env.SARVAM_API_KEY });

async function fail(res, what) {
  const body = await res.text().catch(() => "");
  throw new Error(`Sarvam ${what} ${res.status}: ${body.slice(0, 200)}`);
}

/** Transcribe one short clip of someone saying a single word. */
export async function transcribe(audio, mimeType = "audio/webm") {
  const base = String(mimeType).split(";")[0];
  const ext = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mpeg": "mp3" }[base] || "webm";
  const form = new FormData();
  form.append("file", new Blob([audio], { type: base }), `answer.${ext}`);
  form.append("model", STT_MODEL);
  form.append("language_code", LANG);

  const res = await fetch(STT_URL, { method: "POST", headers: key(), body: form });
  if (!res.ok) await fail(res, "STT");
  const data = await res.json();
  return { text: (data.transcript ?? data.text ?? "").trim(), raw: data };
}

/** Speak a definition or a line of feedback. Returns base64 audio for the page to play. */
export async function speak(text) {
  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { ...key(), "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text.slice(0, 1500),
      language_code: LANG,
      model: TTS_MODEL,
      speaker: SPEAKER,
    }),
  });
  if (!res.ok) await fail(res, "TTS");
  const data = await res.json();
  const audio = data.audios?.[0] ?? data.audio ?? null;
  if (!audio) throw new Error("Sarvam TTS returned no audio");
  return audio;
}

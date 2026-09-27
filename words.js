// Shared word bank — imported by the page and the server.
// [word, part of speech, definition, example, accepted synonyms]
export const LEVELS = {
  easy: [
    ["generous","adj.","willing to give more money, time or help than is expected.","She was generous with her notes before the exam.",["kind"]],
    ["curious","adj.","eager to know or learn something.","A curious kid asks why about everything.",["inquisitive"]],
    ["ancient","adj.","belonging to the very distant past.","They walked through the ruins of an ancient city.",["old"]],
    ["fragile","adj.","easily broken or damaged.","Pack the glasses carefully; they're fragile.",["delicate","breakable"]],
    ["gloomy","adj.","dark or poorly lit, often in a way that feels sad.","A gloomy Monday morning.",["dark","dismal"]],
    ["rapid","adj.","happening in a short time or at great speed.","The city saw rapid growth.",["fast","quick"]],
    ["vast","adj.","extremely large in area or amount.","A vast desert stretched ahead.",["huge","enormous"]],
    ["humble","adj.","not proud; not thinking you are better than others.","He stayed humble after the win.",["modest"]],
    ["eager","adj.","wanting very much to do or have something.","She was eager to start.",["keen"]],
    ["predict","v.","to say what will happen in the future.","Nobody can predict the market.",["forecast"]],
    ["shallow","adj.","not deep.","The kids played in the shallow end.",[]],
    ["reluctant","adj.","unwilling and hesitant.","He was reluctant to speak first.",["unwilling","hesitant"]],
    ["polite","adj.","having good manners and respect for others.","A polite reply, if a little stiff.",["courteous"]],
    ["anxious","adj.","worried or nervous about something uncertain.","She felt anxious before the interview.",["nervous","worried"]],
    ["abundant","adj.","existing in large quantities; more than enough.","Fruit is abundant in summer.",["plentiful"]],
    ["ignore","v.","to deliberately pay no attention to.","He chose to ignore the notification.",[]],
    ["rescue","v.","to save someone from danger.","The crew rescued two hikers.",["save"]],
    ["vivid","adj.","producing strong, clear images in the mind; very bright.","A vivid dream.",["bright"]],
    ["stubborn","adj.","refusing to change your mind.","A stubborn stain, and a stubborn owner.",["obstinate"]],
    ["borrow","v.","to take something with the promise to return it.","Can I borrow your charger?",[]],
    ["brave","adj.","ready to face danger or pain.","A brave thing to admit in public.",["courageous"]],
    ["gather","v.","to bring things or people together in one place.","Gather the receipts before you file.",["collect"]],
    ["silent","adj.","making or accompanied by no sound.","The room went silent.",["quiet"]],
    ["clever","adj.","quick to understand, learn, or work things out.","A clever fix, if a fragile one.",["smart"]],
    ["filthy","adj.","disgustingly dirty.","The keyboard was filthy.",["dirty"]],
    ["tidy","adj.","arranged neatly and in order.","He keeps a tidy desk.",["neat"]],
    ["weary","adj.","very tired, especially from effort.","Weary after the third rewrite.",["tired"]],
    ["delay","v.","to make something happen later than planned.","Rain delayed the match.",["postpone"]],
    ["brief","adj.","lasting only a short time.","A brief meeting, for once.",["short"]],
    ["steep","adj.","rising or falling sharply.","A steep climb to the ridge.",[]],
    ["hollow","adj.","having a hole or empty space inside.","The trunk was hollow.",["empty"]],
    ["loyal","adj.","firm in supporting a person or cause.","A loyal, if noisy, crowd.",["faithful"]],
    ["clumsy","adj.","awkward in movement or handling things.","A clumsy apology.",["awkward"]],
    ["grateful","adj.","feeling or showing thanks.","Grateful for the early warning.",["thankful"]],
    ["rude","adj.","offensively impolite.","A rude reply to a fair question.",["impolite"]],
    ["vanish","v.","to disappear suddenly and completely.","The draft vanished when the tab closed.",["disappear"]],
    ["fierce","adj.","violent or intense in force or feeling.","Fierce competition for the slot.",["intense"]],
    ["whisper","v.","to speak very quietly.","They whispered through the ceremony.",[]],
    ["crowded","adj.","full of people or things.","A crowded platform at six.",["packed"]],
    ["spoil","v.","to ruin or damage something.","Don't spoil the ending.",["ruin"]],
  ],
  medium: [
    ["ephemeral","adj.","lasting for a very short time.","Most of what trends today is ephemeral.",["fleeting","transient"]],
    ["esoteric","adj.","understood by only a small group with specialised knowledge.","The talk drifted into esoteric compiler trivia.",["obscure"]],
    ["obfuscate","v.","to make something unclear or harder to understand.","The memo seemed written to obfuscate.",[]],
    ["prosaic","adj.","lacking imagination; ordinary.","The explanation turned out to be prosaic.",["mundane"]],
    ["ubiquitous","adj.","present, appearing, or found everywhere.","Screens are now ubiquitous.",["omnipresent"]],
    ["capricious","adj.","given to sudden, unaccountable changes of mood or behaviour.","The weather here is capricious.",["fickle"]],
    ["fastidious","adj.","very attentive to accuracy and detail.","A fastidious editor catches everything.",["meticulous"]],
    ["pragmatic","adj.","dealing with things sensibly and realistically.","We took the pragmatic option.",["practical"]],
    ["ameliorate","v.","to make something bad or unsatisfactory better.","Small changes can ameliorate the problem.",["improve"]],
    ["cogent","adj.","clear, logical, and convincing.","She made a cogent case for waiting.",["compelling"]],
    ["diffident","adj.","modest or shy because of a lack of self-confidence.","A diffident speaker with sharp ideas.",["timid"]],
    ["insipid","adj.","lacking flavour, interest, or vigour.","An insipid sequel.",["bland"]],
    ["verbose","adj.","using more words than are needed.","The first draft was verbose.",["wordy"]],
    ["zealous","adj.","showing great energy in pursuit of a cause.","A zealous volunteer.",["fervent"]],
    ["candid","adj.","truthful and straightforward; frank.","Thanks for the candid feedback.",["frank"]],
    ["meticulous","adj.","showing great attention to detail; very careful.","Meticulous notes saved the project.",["fastidious"]],
    ["resilient","adj.","able to recover quickly from difficult conditions.","A resilient system degrades gracefully.",[]],
    ["ambiguous","adj.","open to more than one interpretation.","The instructions were ambiguous.",["vague"]],
    ["benevolent","adj.","well meaning and kindly.","A benevolent, slightly nosy landlord.",["kind"]],
    ["tenacious","adj.","holding firmly to something; persistent.","A tenacious debugger.",["persistent"]],
    ["lucid","adj.","clear and easy to understand.","A lucid explanation of the outage.",["clear"]],
    ["austere","adj.","severely plain; without comfort or decoration.","An austere little office.",["stark"]],
    ["novice","n.","a person new to an activity or field.","A novice at the whiteboard.",["beginner"]],
    ["affluent","adj.","having plenty of money; wealthy.","An affluent suburb.",["wealthy"]],
    ["mitigate","v.","to make something less severe or harmful.","Tests mitigate the risk, they don't remove it.",["lessen"]],
    ["scrutinize","v.","to examine closely and critically.","Scrutinize the numbers before you send them.",["examine"]],
    ["arduous","adj.","requiring great effort; difficult and tiring.","An arduous migration.",["strenuous"]],
    ["eloquent","adj.","fluent and persuasive in speech or writing.","A short, eloquent case for waiting.",["articulate"]],
    ["frugal","adj.","careful with money; not wasteful.","A frugal setup on purpose.",["thrifty"]],
    ["volatile","adj.","liable to change rapidly and unpredictably.","A volatile market.",["unstable"]],
    ["tedious","adj.","too long, slow, or dull.","Tedious but necessary cleanup.",["boring"]],
    ["astute","adj.","having sharp judgement; shrewd.","An astute read of the room.",["shrewd"]],
    ["rigorous","adj.","extremely thorough, careful, and exact.","Rigorous review caught it.",["thorough"]],
    ["plausible","adj.","seeming reasonable or probable.","A plausible explanation, still unproven.",["believable"]],
    ["adamant","adj.","refusing to be persuaded; unshakeable.","She was adamant about the deadline.",["insistent"]],
    ["nuance","n.","a subtle difference in meaning or tone.","The nuance got lost in the summary.",["subtlety"]],
    ["inevitable","adj.","certain to happen; unavoidable.","The rewrite felt inevitable.",["unavoidable"]],
    ["succinct","adj.","briefly and clearly expressed.","A succinct status update.",["concise"]],
    ["impartial","adj.","treating all sides equally; not biased.","An impartial reviewer.",["neutral"]],
    ["morose","adj.","sullen and ill-tempered.","A morose silence after the demo.",["sullen"]],
  ],
  hard: [
    ["laconic","adj.","using very few words.","His laconic reply was a single nod.",["terse"]],
    ["obdurate","adj.","stubbornly refusing to change one's opinion or course of action.","The committee remained obdurate despite the evidence.",[]],
    ["perfunctory","adj.","carried out with minimal effort or reflection.","She gave the report a perfunctory glance.",["cursory"]],
    ["sanguine","adj.","optimistic, especially in a difficult situation.","He was oddly sanguine about the deadline.",[]],
    ["pellucid","adj.","translucently clear; easy to understand.","Her prose is pellucid, even on hard topics.",["lucid"]],
    ["recalcitrant","adj.","having an uncooperative attitude toward authority.","A recalcitrant printer is a universal constant.",["refractory"]],
    ["equanimity","n.","calmness and composure, especially under pressure.","She received the news with equanimity.",["composure"]],
    ["magnanimous","adj.","generous or forgiving, especially toward a rival.","He was magnanimous in victory.",[]],
    ["garrulous","adj.","excessively talkative, especially about trivial matters.","A garrulous neighbour kept us at the gate.",["loquacious"]],
    ["mendacious","adj.","not telling the truth; lying.","The ad was misleading, if not outright mendacious.",[]],
    ["intransigent","adj.","unwilling to change one's views or to agree.","Both sides stayed intransigent.",["uncompromising"]],
    ["lugubrious","adj.","looking or sounding sad and dismal.","The cello played something lugubrious.",["mournful"]],
    ["quotidian","adj.","of or occurring every day; mundane.","The quotidian work of keeping things running.",[]],
    ["sycophant","n.","a person who flatters someone powerful to gain advantage.","The CEO was surrounded by sycophants.",[]],
    ["torpid","adj.","mentally or physically inactive; sluggish.","A torpid afternoon after lunch.",["lethargic"]],
    ["alacrity","n.","brisk and cheerful readiness.","She accepted the offer with alacrity.",[]],
    ["obsequious","adj.","excessively eager to please or obey.","An obsequious waiter hovered nearby.",["servile"]],
    ["perspicacious","adj.","having a ready insight into things; shrewd.","A perspicacious reading of the data.",["astute"]],
    ["truculent","adj.","eager or quick to argue or fight.","A truculent reply-all.",["belligerent"]],
    ["vicissitude","n.","a change of circumstances, typically an unwelcome one.","The vicissitudes of startup life.",[]],
    ["obstreperous","adj.","noisy and difficult to control.","An obstreperous crowd near the gate.",["unruly"]],
    ["ineffable","adj.","too great or extreme to be expressed in words.","An ineffable sense of relief.",["inexpressible"]],
    ["abstruse","adj.","difficult to understand; obscure.","An abstruse footnote nobody read.",["arcane"]],
    ["pernicious","adj.","having a harmful effect, especially a gradual one.","A pernicious little bug.",["harmful"]],
    ["anodyne","adj.","unlikely to cause offence; bland.","An anodyne statement from the board.",["inoffensive"]],
    ["supercilious","adj.","behaving as though superior to others.","A supercilious nod.",["haughty"]],
    ["taciturn","adj.","reserved; saying very little.","A taciturn reviewer with sharp comments.",["reticent"]],
    ["ossify","v.","to become rigid and unable to change.","The process ossified over the years.",["harden"]],
    ["propitious","adj.","giving a good chance of success; favourable.","A propitious moment to ask.",["favourable"]],
    ["fulsome","adj.","excessive and insincere, especially in praise.","Fulsome thanks that convinced nobody.",[]],
    ["pusillanimous","adj.","showing a lack of courage.","A pusillanimous retreat from the decision.",["cowardly"]],
    ["hagiography","n.","a biography that treats its subject with undue reverence.","The profile read as hagiography.",[]],
    ["bowdlerize","v.","to remove parts of a text thought improper.","The edition was bowdlerized.",["censor"]],
    ["apocryphal","adj.","widely circulated but probably untrue.","An apocryphal founding story.",[]],
    ["inchoate","adj.","just begun and not fully formed.","An inchoate plan on a napkin.",["rudimentary"]],
    ["sanctimonious","adj.","making a show of being morally superior.","A sanctimonious reply-all.",["self-righteous"]],
    ["nadir","n.","the lowest point.","The nadir of the quarter.",[]],
    ["palliative","adj.","relieving symptoms without curing the cause.","A palliative fix until the rewrite.",[]],
    ["desultory","adj.","lacking a plan or purpose; going from one thing to another.","A desultory hour of tab-switching.",["aimless"]],
    ["invidious","adj.","likely to arouse resentment; unfairly discriminating.","An invidious comparison.",[]],
  ],
};
for (const k in LEVELS) LEVELS[k] = LEVELS[k].map(([w, pos, def, ex, alt]) => ({ w, pos, def, ex, alt: alt || [] }));

// Each day serves five words per level, cycling through the pool so nothing
// repeats until the whole level has been seen. Day and cycle are UTC-based so
// the page and the server always agree on today's set.
export const DAILY = 5;

export const dayIndex = (d = new Date()) => Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);

function shuffled(items, seed) {
  let a = seed >>> 0 || 1;
  const rand = () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 100_000) / 100_000; };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const LEVEL_SEED = { easy: 11, medium: 23, hard: 47 };

// A cycle is one pass through the pool. Each pass is a fresh shuffle, reordered
// so the words used late in the previous pass land late in this one too — that
// keeps at least five days between repeats (usually eight). Passes are built
// forward from a fixed epoch and cached, so every day is deterministic.
const EPOCH_DAY = dayIndex(new Date("2026-01-01T00:00:00Z"));
const orderCache = new Map();

function orderFor(level, cycle) {
  const key = `${level}:${cycle}`;
  if (orderCache.has(key)) return orderCache.get(key);
  const pool = LEVELS[level];
  let order = shuffled(pool, 7919 + LEVEL_SEED[level]);
  for (let c = 1; c <= cycle; c++) {
    const recent = new Set(order.slice(pool.length / 2).map(w => w.w));
    const next = shuffled(pool, (c + 1) * 7919 + LEVEL_SEED[level]);
    order = [...next.filter(w => !recent.has(w.w)), ...next.filter(w => recent.has(w.w))];
    orderCache.set(`${level}:${c}`, order);
  }
  orderCache.set(key, order);
  return order;
}

export function dailyWords(level, day = dayIndex()) {
  const slots = Math.floor(LEVELS[level].length / DAILY);  // days before the pool repeats
  const n = Math.max(0, day - EPOCH_DAY);
  return orderFor(level, Math.floor(n / slots)).slice((n % slots) * DAILY, (n % slots) * DAILY + DAILY);
}

export const dailySet = (day = dayIndex()) =>
  Object.fromEntries(Object.keys(LEVELS).map(l => [l, dailyWords(l, day)]));

export const ALL_WORDS = Object.values(LEVELS).flat();
export const findWord = w => ALL_WORDS.find(x => x.w === w);
export const levelOf = w => Object.keys(LEVELS).find(l => LEVELS[l].some(x => x.w === w));

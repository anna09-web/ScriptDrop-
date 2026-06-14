// Pure, client-side creator tools. None of these call any API or require a key —
// they run entirely in the browser, which makes them free to serve and a nice
// value-add alongside the (metered) AI script generator.

/* ------------------------------------------------------------------ */
/* Hook Analyzer                                                       */
/* ------------------------------------------------------------------ */

export interface HookFactor {
  label: string;
  hit: boolean;
  detail: string;
}

export interface HookAnalysis {
  score: number;
  rating: 'Weak' | 'Okay' | 'Strong' | 'Scroll-stopping';
  factors: HookFactor[];
  tips: string[];
  wordCount: number;
}

const POWER_WORDS = [
  'secret', 'mistake', 'stop', 'never', 'nobody', 'everyone', 'instantly',
  'proven', 'finally', 'truth', 'warning', 'free', 'easy', 'fast', 'best',
  'worst', 'hate', 'love', 'obsessed', 'shocked', 'insane', 'crazy', 'genius',
  'hack', 'wrong', 'avoid', 'before', 'after', 'results', 'literally',
];

const CURIOSITY_TRIGGERS = [
  'why', 'how', 'what', 'this is why', 'here’s why', "here's why",
  'the reason', 'what happens', 'nobody tells you', "you won't believe",
  'you wont believe', 'turns out', 'i tried', 'i tested', 'watch this',
  'wait for it', 'pov', 'story time', 'storytime',
];

const EMOTION_WORDS = [
  'embarrassing', 'embarrassed', 'struggle', 'struggled', 'obsessed', 'love',
  'hate', 'scared', 'nervous', 'excited', 'frustrated', 'amazing', 'terrible',
  'addicted', 'desperate', 'regret', 'proud', 'shocked',
];

function countMatches(haystack: string, needles: string[]): string[] {
  return needles.filter((n) => haystack.includes(n));
}

export function analyzeHook(input: string): HookAnalysis {
  const text = input.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const factors: HookFactor[] = [];
  let score = 0;

  // Length: hooks land best around 5-14 words.
  const goodLength = wordCount >= 4 && wordCount <= 14;
  if (goodLength) score += 22;
  else if (wordCount > 0 && wordCount <= 20) score += 12;
  factors.push({
    label: 'Punchy length',
    hit: goodLength,
    detail: goodLength
      ? `${wordCount} words — tight enough to land in 3 seconds.`
      : wordCount === 0
        ? 'Type a hook to analyze it.'
        : `${wordCount} words — aim for 4–14 so it reads fast on camera.`,
  });

  // Power words.
  const powerHits = countMatches(lower, POWER_WORDS);
  const hasPower = powerHits.length > 0;
  if (hasPower) score += Math.min(22, powerHits.length * 11);
  factors.push({
    label: 'Power words',
    hit: hasPower,
    detail: hasPower
      ? `Found: ${powerHits.slice(0, 4).join(', ')}.`
      : 'Add a charged word like “stop”, “mistake”, “nobody”, or “secret”.',
  });

  // Curiosity gap.
  const curiosityHits = countMatches(lower, CURIOSITY_TRIGGERS);
  const hasCuriosity = curiosityHits.length > 0;
  if (hasCuriosity) score += 20;
  factors.push({
    label: 'Curiosity gap',
    hit: hasCuriosity,
    detail: hasCuriosity
      ? 'Opens a loop the viewer wants closed.'
      : 'Hint at something they don’t know yet (“here’s why…”, “what nobody tells you…”).',
  });

  // Specificity: numbers make it concrete.
  const hasNumber = /\d/.test(text);
  if (hasNumber) score += 14;
  factors.push({
    label: 'Specific / numeric',
    hit: hasNumber,
    detail: hasNumber
      ? 'A number makes the promise concrete.'
      : 'Try a number — “3 things”, “in 7 days”, “$0”.',
  });

  // Direct address: "you" / "your".
  const hasYou = /\b(you|your|you’re|you're)\b/i.test(text);
  if (hasYou) score += 12;
  factors.push({
    label: 'Talks to the viewer',
    hit: hasYou,
    detail: hasYou
      ? 'Speaks directly to one person.'
      : 'Address the viewer as “you” so it feels personal.',
  });

  // Emotion.
  const emotionHits = countMatches(lower, EMOTION_WORDS);
  const hasEmotion = emotionHits.length > 0;
  if (hasEmotion) score += 10;
  factors.push({
    label: 'Emotional pull',
    hit: hasEmotion,
    detail: hasEmotion
      ? 'Carries a feeling, not just a fact.'
      : 'Name a feeling (“embarrassing”, “obsessed”, “frustrated”).',
  });

  score = Math.max(0, Math.min(100, Math.round(score)));

  let rating: HookAnalysis['rating'] = 'Weak';
  if (score >= 80) rating = 'Scroll-stopping';
  else if (score >= 60) rating = 'Strong';
  else if (score >= 40) rating = 'Okay';

  const tips = factors
    .filter((f) => !f.hit)
    .map((f) => f.detail)
    .slice(0, 3);

  return { score, rating, factors, tips, wordCount };
}

/* ------------------------------------------------------------------ */
/* Hashtag Generator                                                   */
/* ------------------------------------------------------------------ */

export type Platform = 'TikTok' | 'Instagram Reels' | 'YouTube Shorts';

export interface HashtagSet {
  broad: string[];
  niche: string[];
  micro: string[];
}

const BROAD_BY_PLATFORM: Record<Platform, string[]> = {
  TikTok: ['#fyp', '#foryou', '#foryoupage', '#tiktokmademebuyit', '#viral'],
  'Instagram Reels': ['#reels', '#reelsinstagram', '#explore', '#instagood', '#trending'],
  'YouTube Shorts': ['#shorts', '#youtubeshorts', '#shortsfeed', '#viralshorts', '#subscribe'],
};

function slug(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tokenize(topic: string): string[] {
  return topic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 5);
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'your', 'you', 'are', 'our',
  'from', 'has', 'have', 'will', 'can', 'get', 'best', 'new', 'use', 'using',
]);

export function generateHashtags(topic: string, platform: Platform): HashtagSet {
  const tokens = tokenize(topic);
  const broad = [...BROAD_BY_PLATFORM[platform]];

  const niche = new Set<string>();
  const micro = new Set<string>();

  const nicheSuffixes = ['tips', 'hacks', 'community', 'lover', 'daily', 'review'];
  const microSuffixes = ['routine', 'before', 'after', 'review2024', 'unboxing', 'honest', 'worthit'];

  for (const t of tokens) {
    niche.add(`#${slug(t)}`);
    for (const s of nicheSuffixes) niche.add(`#${slug(t)}${s}`);
  }

  // Combine pairs of tokens for long-tail micro tags.
  for (let i = 0; i < tokens.length; i++) {
    for (const s of microSuffixes) {
      micro.add(`#${slug(tokens[i])}${s}`);
    }
    if (i + 1 < tokens.length) {
      micro.add(`#${slug(tokens[i])}${slug(tokens[i + 1])}`);
    }
  }

  // Platform-flavored niche tags.
  const platformTag =
    platform === 'TikTok' ? 'tok' : platform === 'Instagram Reels' ? 'gram' : 'shorts';
  for (const t of tokens) niche.add(`#${slug(t)}${platformTag}`);

  return {
    broad: broad.slice(0, 5),
    niche: Array.from(niche).slice(0, 12),
    micro: Array.from(micro).slice(0, 10),
  };
}

/* ------------------------------------------------------------------ */
/* Content Idea Spinner                                                */
/* ------------------------------------------------------------------ */

const IDEA_TEMPLATES = [
  'The honest review nobody asked for: {topic}',
  '3 things I wish I knew before buying {topic}',
  'POV: you finally fixed [problem] with {topic}',
  'Watch me test {topic} so you don’t have to',
  'Why everyone’s wrong about {topic}',
  'I used {topic} for 7 days — here’s what happened',
  'Stop scrolling if you struggle with [problem]. {topic} changed it',
  'Rating {topic} as someone who was super skeptical',
  'The {topic} mistake that’s costing you [result]',
  'Get ready with me while I explain why {topic} is worth it',
  'Things that just make sense: {topic} edition',
  'Unboxing {topic} + my completely unfiltered first reaction',
  'A day in my life… but {topic} does all the work',
  'Tell me you need {topic} without telling me',
  'Green flags in a [category] product: {topic} has all of them',
];

export function spinIdeas(topic: string, count = 10): string[] {
  const clean = topic.trim() || 'your product';
  const shuffled = [...IDEA_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((t) => t.replace(/\{topic\}/g, clean));
}

/* ------------------------------------------------------------------ */
/* Best Time to Post                                                   */
/* ------------------------------------------------------------------ */

export interface PostingWindow {
  day: string;
  windows: string[];
}

// General, widely-cited engagement windows (local time). A guide, not a guarantee.
export const BEST_TIMES: Record<Platform, PostingWindow[]> = {
  TikTok: [
    { day: 'Mon', windows: ['6–9am', '7–11pm'] },
    { day: 'Tue', windows: ['2–4am', '9am', '7–9pm'] },
    { day: 'Wed', windows: ['7–9am', '11am', '8pm'] },
    { day: 'Thu', windows: ['9am', '12pm', '7pm'] },
    { day: 'Fri', windows: ['5am', '1–3pm', '7pm'] },
    { day: 'Sat', windows: ['11am', '7–8pm'] },
    { day: 'Sun', windows: ['7–9am', '4pm', '7–9pm'] },
  ],
  'Instagram Reels': [
    { day: 'Mon', windows: ['6am', '12pm', '7pm'] },
    { day: 'Tue', windows: ['9am', '1pm', '8pm'] },
    { day: 'Wed', windows: ['11am', '2pm', '9pm'] },
    { day: 'Thu', windows: ['9–11am', '7pm'] },
    { day: 'Fri', windows: ['7am', '1pm', '5pm'] },
    { day: 'Sat', windows: ['9–11am', '7pm'] },
    { day: 'Sun', windows: ['10am', '6–8pm'] },
  ],
  'YouTube Shorts': [
    { day: 'Mon', windows: ['12pm', '3–4pm'] },
    { day: 'Tue', windows: ['2pm', '8–9pm'] },
    { day: 'Wed', windows: ['12pm', '5pm'] },
    { day: 'Thu', windows: ['12–3pm', '9pm'] },
    { day: 'Fri', windows: ['12pm', '3pm', '7pm'] },
    { day: 'Sat', windows: ['9–11am', '6pm'] },
    { day: 'Sun', windows: ['9–11am', '6–8pm'] },
  ],
};

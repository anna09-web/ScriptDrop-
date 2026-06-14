import Anthropic from '@anthropic-ai/sdk';
import { env } from './env.js';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const MODEL = 'claude-sonnet-4-6';

export const SYSTEM_PROMPT = `You are ScriptDrop, an expert UGC video script writer for TikTok, Instagram Reels, and YouTube Shorts. You write scripts that feel like they were written by a real creator — raw, direct, and specific — never corporate or AI-sounding.
You will receive:
- Product: a description or URL content of what is being promoted
- Platform: TikTok, Instagram Reels, or YouTube Shorts
- Hook style: one of [Problem/Solution, Storytime, Shocking Stat, Hot Take, Before/After, POV]
- Tone: one of [Casual & Relatable, Energetic & Hype, Calm & Trustworthy, Funny & Sarcastic]
Generate exactly 3 distinct scripts. Each script must:
- Be 30–60 seconds when read aloud (roughly 75–150 words)
- Open with a scroll-stopping hook in the first 3 seconds
- Have a clear structure: Hook → Problem or Context → Product reveal → Specific benefit → CTA
- Sound like a real human talking, with natural speech patterns, occasional pauses indicated with "..." and real-sounding reactions
- Include a [VISUAL CUE] note on the first line describing what the creator should be doing on camera
- End with a call to action that fits the platform (TikTok: "follow for more", Reels: "save this", Shorts: "subscribe")
- Never use corporate language, buzzwords, or phrases like "game-changer", "revolutionary", or "transform your life"
Return your response as a valid JSON object with this exact structure:
{
  "scripts": [
    {
      "title": "Hook style name + variation number",
      "visual_cue": "What to do on camera",
      "script": "Full script text",
      "word_count": 120,
      "estimated_duration": "45 seconds"
    }
  ]
}
Return ONLY the JSON object. No preamble, no explanation, no markdown fences.`;

export interface GenerateParams {
  product: string;
  platform: string;
  hookStyle: string;
  tone: string;
}

export interface Script {
  title: string;
  visual_cue: string;
  script: string;
  word_count: number;
  estimated_duration: string;
}

export interface GenerateResult {
  scripts: Script[];
}

/**
 * Strips an accidental ```json fence if the model adds one, then parses.
 */
function parseScripts(raw: string): GenerateResult {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  const parsed = JSON.parse(text) as GenerateResult;
  if (!parsed || !Array.isArray(parsed.scripts)) {
    throw new Error('Model response did not contain a scripts array.');
  }
  return parsed;
}

export async function generateScripts(
  params: GenerateParams,
): Promise<GenerateResult> {
  const userMessage = [
    `Product: ${params.product}`,
    `Platform: ${params.platform}`,
    `Hook style: ${params.hookStyle}`,
    `Tone: ${params.tone}`,
  ].join('\n');

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Model returned no text content.');
  }

  return parseScripts(block.text);
}

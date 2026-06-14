export interface DisplayPack {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  credits: number;
  price: string;
  blurb: string;
  highlighted: boolean;
}

// Display-only. The backend is the source of truth for actual charge amounts.
export const PACKS: DisplayPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: '$15',
    blurb: 'Dip a toe in. 5 generations, 15 scripts.',
    highlighted: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    credits: 15,
    price: '$29',
    blurb: 'For people posting every week. 45 scripts.',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 40,
    price: '$59',
    blurb: 'Daily posters and agencies. 120 scripts.',
    highlighted: false,
  },
];

export const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts'] as const;

export const HOOK_STYLES = [
  'Problem/Solution',
  'Storytime',
  'Shocking Stat',
  'Hot Take',
  'Before/After',
  'POV',
] as const;

export const TONES = [
  'Casual & Relatable',
  'Energetic & Hype',
  'Calm & Trustworthy',
  'Funny & Sarcastic',
] as const;

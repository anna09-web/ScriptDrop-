import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { PricingCard } from '../components/PricingCard';
import { PACKS } from '../lib/packs';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const appHref = session ? '/app' : '/signup';

  return (
    <div className="min-h-screen bg-bg">
      <MarketingNav appHref={appHref} signedIn={!!session} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          UGC scripts in 30 seconds
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Stop staring at a blank script.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-text-muted">
          Paste your product. Pick a hook. Get 3 ready-to-film scripts your
          audience will actually watch.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={appHref} className="btn-primary">
            Generate your first script free →
          </Link>
          <a href="#how" className="btn-ghost">
            See how it works
          </a>
        </div>

        {/* Script card mock */}
        <div className="mt-16">
          <ScriptMock />
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border bg-bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-sm uppercase tracking-widest text-text-muted">
            Used by 2,400+ creators
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.handle} className="card p-5">
                <blockquote className="text-sm leading-relaxed text-text-primary">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-text-muted">
                  {t.handle}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Three steps. Under 30 seconds.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="font-display text-2xl font-bold text-accent">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl font-bold">{step.title}</h3>
              <p className="text-text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free toolkit */}
      <section className="border-t border-border bg-bg-card">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Included free with every account
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Not just scripts. A whole filming toolkit.
          </h2>
          <p className="mt-3 max-w-xl text-text-muted">
            These run right in your browser — no credits, no limits. They’re
            yours the moment you sign up.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLKIT.map((tool) => (
              <div key={tool.title} className="card p-5">
                <h3 className="font-display text-lg font-bold">{tool.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{tool.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Pay once. Use whenever.
          </h2>
          <p className="mt-3 max-w-xl text-text-muted">
            One credit makes one generation, which gives you three scripts. No
            subscription, no auto-renew. Credits never expire — and the hook
            analyzer, hashtag generator, idea spinner, and posting-time guide are
            free forever.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PACKS.map((pack) => (
              <PricingCard
                key={pack.id}
                pack={pack}
                ctaLabel="Get started"
                onSelect={() => navigate(appHref)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Questions, answered.
          </h2>
          <div className="mt-10 divide-y divide-border">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {faq.q}
                  <span className="text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MarketingNav({
  appHref,
  signedIn,
}: {
  appHref: string;
  signedIn: boolean;
}) {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:inline"
          >
            Pricing
          </a>
          {signedIn ? (
            <Link to="/app" className="btn-primary px-5 py-2 text-sm">
              Open app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                Log in
              </Link>
              <Link to={appHref} className="btn-primary px-5 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function ScriptMock() {
  return (
    <div className="card mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-muted">
          TikTok · Problem/Solution · Casual & Relatable
        </span>
        <span className="text-xs text-text-muted">42 seconds</span>
      </div>
      <div className="mt-4 rounded-lg border border-border bg-bg-elevated px-3 py-2">
        <span className="text-[11px] uppercase tracking-wide text-accent">
          Visual cue
        </span>
        <p className="mt-1 text-sm">
          Hold the bottle up to the camera, then point at your under-eye area.
        </p>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
        {`Okay so I almost didn't post this... but my under-eyes were genuinely embarrassing me. Concealer just sat in the creases, made it worse.

Then my esthetician handed me this. No big claims, she just said "use it for a week."

A week later? The puffiness I'd had since college is... gone. I'm not exaggerating.

If you've tried everything, try this before you give up. Follow for more — I post the stuff that actually works.`}
      </p>
    </div>
  );
}

const TOOLKIT = [
  {
    title: 'Hook Analyzer',
    body: 'Paste your first line and get a scroll-stopping score with fixes — instantly.',
  },
  {
    title: 'Hashtag Generator',
    body: 'A balanced mix of broad, niche, and long-tail tags for each platform.',
  },
  {
    title: 'Idea Spinner',
    body: 'Ten ready-to-film content angles for any product, one click away.',
  },
  {
    title: 'Best Time to Post',
    body: 'Engagement windows by day for TikTok, Reels, and Shorts.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I used to spend a whole afternoon on one script. Now I batch a week of content before my coffee gets cold.',
    handle: '@maya.makes',
  },
  {
    quote:
      "The hooks don't sound like a robot wrote them. That was my whole problem with every other tool.",
    handle: '@deshawncreates',
  },
  {
    quote:
      'Three options every time means I always have a B-roll plan if the first take flops.',
    handle: '@thatskincaregirl',
  },
];

const STEPS = [
  {
    title: 'Paste your product',
    body: 'Drop in a link or just describe what you’re promoting. A sentence is enough.',
  },
  {
    title: 'Pick your angle',
    body: 'Choose a hook style, platform, and tone. The defaults work if you’re in a hurry.',
  },
  {
    title: 'Film it',
    body: 'Get three distinct scripts with visual cues and timing. Copy, read, post.',
  },
];

const FAQS = [
  {
    q: 'Do credits expire?',
    a: 'No. Buy a pack whenever, use it whenever. Credits sit in your account until you spend them.',
  },
  {
    q: 'Is this actually different from ChatGPT?',
    a: 'Yes. ScriptDrop is tuned specifically for short-form UGC — hook-first structure, on-camera visual cues, platform-correct CTAs, and a voice that sounds like a real creator instead of a press release. You don’t have to prompt-engineer anything.',
  },
  {
    q: 'What platforms does it write for?',
    a: 'TikTok, Instagram Reels, and YouTube Shorts. The CTA and pacing adjust to whichever you pick.',
  },
  {
    q: 'How many scripts do I get per credit?',
    a: 'One credit produces one generation, and every generation gives you three distinct scripts to choose from.',
  },
  {
    q: 'Can I use the scripts commercially?',
    a: 'Yes — you own the scripts you generate. Use them for your brand, your clients, whatever you like.',
  },
  {
    q: 'What if a generation comes out bad?',
    a: 'Tweak your description or switch the hook style and run it again. Most people land on something they love within a credit or two.',
  },
];

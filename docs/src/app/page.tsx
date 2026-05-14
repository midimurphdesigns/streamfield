'use client';

import { useMemo, useState } from 'react';
import { StreamingReveal, type RevealVariant } from 'streamfield';

// A representative partial-object shape — the kind of thing
// streamObject from the Vercel AI SDK actually emits for a small
// generative-UI suggestion.
type Suggestion = {
  title: string;
  summary: string;
  bullets: string[];
  confidence: number;
};

// Synthetic stream snapshots. The playground scrubs through these as
// the slider moves, simulating the partial-object timeline a real
// streamObject call produces.
const FRAMES: Array<Partial<Suggestion>> = [
  {},
  { title: 'Top-perform' },
  { title: 'Top-performing regions' },
  { title: 'Top-performing regions', summary: 'North' },
  { title: 'Top-performing regions', summary: 'North America leads' },
  {
    title: 'Top-performing regions',
    summary: 'North America leads on ARR, Europe leads on seats per deal.',
  },
  {
    title: 'Top-performing regions',
    summary: 'North America leads on ARR, Europe leads on seats per deal.',
    bullets: ['NA: $1.2M ARR'],
  },
  {
    title: 'Top-performing regions',
    summary: 'North America leads on ARR, Europe leads on seats per deal.',
    bullets: ['NA: $1.2M ARR', 'EU: 12.4 seats/deal'],
  },
  {
    title: 'Top-performing regions',
    summary: 'North America leads on ARR, Europe leads on seats per deal.',
    bullets: ['NA: $1.2M ARR', 'EU: 12.4 seats/deal', 'APAC: 38% churn'],
  },
  {
    title: 'Top-performing regions',
    summary: 'North America leads on ARR, Europe leads on seats per deal.',
    bullets: ['NA: $1.2M ARR', 'EU: 12.4 seats/deal', 'APAC: 38% churn'],
    confidence: 0.86,
  },
];

const VARIANTS: RevealVariant[] = ['cascade', 'shimmer', 'underline-fill'];

export default function Home() {
  const [frame, setFrame] = useState(FRAMES.length - 1);
  const [variant, setVariant] = useState<RevealVariant>('cascade');
  const stream = useMemo(() => FRAMES[frame], [frame]);
  const done = frame === FRAMES.length - 1;

  return (
    <main className="container-edge py-16">
      <header className="max-w-[68ch]">
        <p className="eyebrow">streamfield</p>
        <h1 className="type-display mt-6 text-[clamp(48px,8vw,84px)]">
          Your streaming AI UI
          <br />
          feels{' '}
          <span className="text-[color:var(--color-accent)]">broken.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] type-mono text-[color:var(--color-ink-muted)]">
          If you&apos;ve built a UI on `streamObject` from the Vercel AI SDK, you know
          the feeling: the title flickers in, the bullets snap into the DOM, the summary
          rewrites itself mid-render. CSS transitions can&apos;t see what changed.
          streamfield can. It diffs each partial-object snapshot, tells you which
          fields are still arriving, and hands the state to your children via render prop.
        </p>
        <p className="mt-4 max-w-[60ch] type-mono-tiny text-[color:var(--color-ink-faint)]">
          For: anyone who&apos;s shipped a streamObject UI and watched the fields land like a slot machine.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <code className="rounded-lg border border-[color:var(--color-divider)] bg-[color:var(--color-canvas-2)] px-4 py-2 type-mono text-[color:var(--color-ink)]">
            npm install streamfield
          </code>
          <a
            href="https://github.com/midimurphdesigns/streamfield"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[color:var(--color-divider)] px-4 py-2 type-mono text-[color:var(--color-ink-muted)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      {/* Playground — controls on top, side-by-side render below.
          The left pane shows raw partials (the broken default). The
          right pane runs the same partial through streamfield. Scrub
          the slider; the difference makes the case. */}
      <section className="mt-16 surface p-6">
        <p className="eyebrow">playground · before vs. after</p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="type-mono-tiny text-[color:var(--color-ink-faint)]">
              variant
            </label>
            <div className="flex gap-2">
              {VARIANTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`rounded-full border px-3 py-1 type-mono transition-colors ${
                    variant === v
                      ? 'border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
                      : 'border-[color:var(--color-divider)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-accent)]/40'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <label className="block flex-1 min-w-[240px]">
            <span className="type-mono-tiny text-[color:var(--color-ink-faint)]">
              stream frame {frame + 1} / {FRAMES.length}
            </span>
            <input
              type="range"
              min={0}
              max={FRAMES.length - 1}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              className="mt-2 w-full accent-[color:var(--color-accent)]"
            />
          </label>
        </div>

        <p className="mt-3 type-mono-tiny text-[color:var(--color-ink-faint)]">
          Scrub the slider. Watch the left pane flicker as fields snap in. Watch the right pane handle it.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-[color:var(--color-divider)] bg-[color:var(--color-canvas-2)]/40 p-5">
            <p className="eyebrow text-[color:var(--color-fail)]/70">without streamfield</p>
            <div className="mt-5 min-h-[200px]">
              <article className="space-y-4">
                <h2 className="text-[clamp(20px,2.4vw,28px)] font-medium text-[color:var(--color-ink)]">
                  {stream.title ?? ''}
                </h2>
                <p className="max-w-[60ch] type-mono text-[color:var(--color-ink-muted)]">
                  {stream.summary ?? ''}
                </p>
                {stream.bullets && (
                  <ul className="space-y-1 type-mono text-[color:var(--color-ink)]">
                    {stream.bullets.map((b, i) => (
                      <li key={i}>· {b}</li>
                    ))}
                  </ul>
                )}
                {stream.confidence !== undefined && (
                  <p className="type-mono-tiny text-[color:var(--color-ink-faint)]">
                    confidence {(stream.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </article>
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--color-accent)]/40 bg-[color:var(--color-canvas-2)]/40 p-5">
            <p className="eyebrow text-[color:var(--color-accent)]">with streamfield</p>
            <div className="mt-5 min-h-[200px]">
              <StreamingReveal<Suggestion> stream={stream} variant={variant} done={done}>
                {(f) => (
                  <article className="space-y-4">
                    <h2
                      data-streamfield-state={f.title?.state}
                      className="text-[clamp(20px,2.4vw,28px)] font-medium text-[color:var(--color-ink)]"
                    >
                      {f.title?.value ?? ' '}
                    </h2>
                    <p
                      data-streamfield-state={f.summary?.state}
                      className="max-w-[60ch] type-mono text-[color:var(--color-ink-muted)]"
                    >
                      {f.summary?.value ?? ' '}
                    </p>
                    {f.bullets?.value && (
                      <ul
                        data-streamfield-state={f.bullets?.state}
                        className="space-y-1 type-mono text-[color:var(--color-ink)]"
                      >
                        {f.bullets.value.map((b, i) => (
                          <li key={i}>· {b}</li>
                        ))}
                      </ul>
                    )}
                    {f.confidence?.value !== undefined && (
                      <p
                        data-streamfield-state={f.confidence?.state}
                        className="type-mono-tiny text-[color:var(--color-ink-faint)]"
                      >
                        confidence {(f.confidence.value * 100).toFixed(0)}%
                      </p>
                    )}
                  </article>
                )}
              </StreamingReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Code sample */}
      <section className="mt-20 max-w-[68ch]">
        <p className="eyebrow">usage</p>
        <h2 className="type-display mt-4 text-[clamp(28px,3.4vw,40px)]">
          One render prop. Four props. Done.
        </h2>
        <pre className="mt-6 overflow-x-auto rounded-lg border border-[color:var(--color-divider)] bg-[color:var(--color-canvas-2)] p-5 text-[13px] leading-[1.6] text-[color:var(--color-ink-muted)]">
          <code>{`import { StreamingReveal } from 'streamfield';
import 'streamfield/styles.css'; // optional defaults

<StreamingReveal stream={partial} variant="cascade" done={done}>
  {(f) => (
    <article>
      <h2 data-streamfield-state={f.title?.state}>{f.title?.value}</h2>
      <p data-streamfield-state={f.summary?.state}>{f.summary?.value}</p>
    </article>
  )}
</StreamingReveal>`}</code>
        </pre>
      </section>

      <footer className="mt-24 border-t border-[color:var(--color-divider)] pt-8">
        <p className="type-mono text-[color:var(--color-ink-muted)]">
          streamfield · made by{' '}
          <a
            href="https://kevinmurphywebdev.com"
            className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-ink-faint)] underline-offset-4 transition-colors hover:text-[color:var(--color-accent)]"
          >
            Kevin Murphy
          </a>{' '}
          · extracted from{' '}
          <a
            href="https://tablesalt.kevinmurphywebdev.com"
            className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-ink-faint)] underline-offset-4 transition-colors hover:text-[color:var(--color-accent)]"
          >
            tablesalt
          </a>
        </p>
      </footer>
    </main>
  );
}

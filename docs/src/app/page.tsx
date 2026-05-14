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
          The streaming-UI piece
          <br />
          your AI app is{' '}
          <span className="text-[color:var(--color-accent)]">missing.</span>
        </h1>
        <p className="mt-8 max-w-[60ch] type-mono text-[color:var(--color-ink-muted)]">
          A React primitive for rendering Vercel AI SDK partial-object streams with
          field-by-field reveal physics. Diffs successive snapshots, derives per-field
          pending → streaming → complete state, hands you the state via render prop.
          Style it however you want.
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

      {/* Playground */}
      <section className="mt-20 grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="surface p-6">
          <p className="eyebrow">playground</p>
          <div className="mt-4 flex items-center gap-3">
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

          <label className="mt-6 block">
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

          <p className="mt-8 type-mono-tiny text-[color:var(--color-ink-faint)]">
            scrub the slider — fields enter as they appear in the partial
          </p>
        </div>

        <div className="surface p-6">
          <p className="eyebrow">render</p>
          <div className="mt-6">
            <StreamingReveal<Suggestion> stream={stream} variant={variant} done={done}>
              {(f) => (
                <article className="space-y-4">
                  <h2
                    data-streamfield-state={f.title?.state}
                    className="text-[clamp(20px,2.4vw,28px)] font-medium text-[color:var(--color-ink)]"
                  >
                    {f.title?.value ?? ' '}
                  </h2>
                  <p
                    data-streamfield-state={f.summary?.state}
                    className="max-w-[60ch] type-mono text-[color:var(--color-ink-muted)]"
                  >
                    {f.summary?.value ?? ' '}
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
      </section>

      {/* Code sample */}
      <section className="mt-20 max-w-[68ch]">
        <p className="eyebrow">usage</p>
        <h2 className="type-display mt-4 text-[clamp(28px,3.4vw,40px)]">
          A render-prop, not a kitchen sink.
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

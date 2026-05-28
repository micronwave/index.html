import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type {
  Person,
  About,
  ExperienceEntry,
  SkillGroup,
  EducationEntry,
  Certification,
} from '../data/content';
import GridBackground from './GridBackground';

async function copyTextToClipboard(text: string) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
      const legacyDocument = document as Document & {
        execCommand(commandId: 'copy'): boolean;
      };
      return legacyDocument.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// ── Scroll reveal ──────────────────────────────────────────────────────────

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('visible');
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Nav ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '#about', label: 'about' },
  { href: '#experience', label: 'experience' },
  { href: '#projects', label: 'projects' },
  { href: '#contact', label: 'contact' },
];

function SiteNav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? y / docHeight : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`} aria-label="Site navigation">
        <span className="nav-name">{name}</span>

        {/* Desktop links */}
        <ul className="nav-links" aria-hidden={menuOpen}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>

        {/* Hamburger button — mobile only */}
        <button
          className={`nav-hamburger${menuOpen ? ' open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          className="scroll-progress-bar"
          aria-hidden="true"
          style={{ '--scroll-progress': scrollProgress } as CSSProperties}
        />
      </nav>

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className="mobile-nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={close}>{label}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="mobile-menu-backdrop" aria-hidden="true" onClick={close} />
      )}
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────

function HeroSection({ person }: { person: Person }) {
  const firstName = person.name.split(' ')[0];
  const lastName = person.name.split(' ').slice(1).join(' ');
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!showEmail) return;
    const didCopy = await copyTextToClipboard(person.email);
    if (!didCopy) return;

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="hero page-wrapper" aria-label="Introduction">
      <h1 aria-label={person.name}>
        {firstName}
        <br />
        <em>{lastName}</em>
      </h1>
      <p className="hero-sub">
        Operations engineer building with cloud, security, and AI.<br />
        I find what's inefficient and fix it.
      </p>
      <div className="hero-links-group">
        <div className="hero-links">
          <a className="hero-link" href={person.github} target="_blank" rel="noopener noreferrer">
            <span className="hero-link-text">GitHub</span>
            <span className="hero-link-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="hero-link" href={person.linkedin} target="_blank" rel="noopener noreferrer">
            <span className="hero-link-text">LinkedIn</span>
            <span className="hero-link-arrow" aria-hidden="true">↗</span>
          </a>
          <span className={`hero-email${showEmail ? ' visible' : ''}`}>
            <button
              className="hero-link"
              type="button"
              aria-expanded={showEmail}
              aria-controls="hero-email-address"
              onClick={() => setShowEmail((visible) => !visible)}
            >
              <span className="hero-link-text">Email</span>
            </button>
            <span id="hero-email-address" className="hero-email-address" aria-hidden={!showEmail}>
              {person.email}
            </span>
            <button
              className={`hero-copy-btn${copied ? ' copied' : ''}`}
              type="button"
              aria-label={copied ? 'Copied!' : 'Copy email address'}
              tabIndex={showEmail ? 0 : -1}
              onClick={copyEmail}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="2,7 5,10 11,3" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.2" />
                  <path d="M8 4.5V2.5a1 1 0 00-1-1H2.5a1 1 0 00-1 1V7a1 1 0 001 1H4.5" />
                </svg>
              )}
            </button>
          </span>
        </div>
        {/* Mobile: email address drops below the links row, absolutely positioned so nothing shifts */}
        <div
          className={`hero-email-drop${showEmail ? ' visible' : ''}`}
          aria-hidden={!showEmail}
        >
          <span className="hero-email-drop-address">{person.email}</span>
          <button
            className={`hero-copy-btn${copied ? ' copied' : ''}`}
            type="button"
            aria-label={copied ? 'Copied!' : 'Copy email address'}
            tabIndex={showEmail ? 0 : -1}
            onClick={copyEmail}
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="2,7 5,10 11,3" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.2" />
                <path d="M8 4.5V2.5a1 1 0 00-1-1H2.5a1 1 0 00-1 1V7a1 1 0 001 1H4.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Section header ────────────────────────────────────────────────────────

function SectionHead({ title }: { title: string }) {
  const ref = useReveal();
  return (
    <div className="section-header reveal" ref={ref as React.RefObject<HTMLDivElement>}>
      <h2 className="section-title">{title}</h2>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────

function AboutSection({
  about,
  person,
  education,
  certifications,
}: {
  about: About;
  person: Person;
  education: EducationEntry[];
  certifications: Certification[];
}) {
  return (
    <section id="about" className="section page-wrapper">
      <SectionHead title="About" />
      <div className="about-content">
        <div className="about-text">
          {about.summary.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <aside className="about-sidebar">
          <div className="detail-group">
            <span className="detail-label">Location</span>
            <span className="detail-value">{person.location}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Focus</span>
            <span className="detail-value">Cloud · Security · AI</span>
          </div>
          {certifications.map((cert) => (
            <div className="detail-group" key={cert.name}>
              <span className="detail-label">Certification</span>
              <span className="detail-value">
                {cert.verifyUrl ? (
                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="cert-verify-link">
                    <span>{cert.name.replace(' (CLF-C02)', '')}</span>
                    <span className="cert-verify-row">Verify <span className="arrow" aria-hidden="true">↗</span></span>
                  </a>
                ) : (
                  cert.name
                )}
              </span>
            </div>
          ))}
          {education.map((ed) => (
            <div className="detail-group" key={ed.institution}>
              <span className="detail-label">Education</span>
              <span className="detail-value">
                {ed.degree}, {ed.institution.split(',')[0]}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

// ── Pip terminal data ─────────────────────────────────────────────────────

const PIP_LINES = [
  { text: '> pip install aaron-altergott', tone: 'command' },
  { text: '', tone: 'spacer' },
  { text: 'Resolving dependencies...', tone: 'status' },
  { text: '  ✓ python>=3.11', tone: 'ok' },
  { text: '  ✓ aws-bedrock', tone: 'ok' },
  { text: '  ✓ lambda + api-gateway', tone: 'ok' },
  { text: '  ✓ pinecone | faiss', tone: 'ok' },
  { text: '  ✓ hdbscan', tone: 'ok' },
  { text: '  ✓ fastapi', tone: 'ok' },
  { text: '  ✓ powershell-hooks', tone: 'ok' },
  { text: '', tone: 'spacer' },
  { text: 'Building wheels...', tone: 'status' },
  { text: '  ✓ retrieval-pipeline', tone: 'ok' },
  { text: '  ✓ serverless-deploy', tone: 'ok' },
  { text: '  ✓ agent-guardrails', tone: 'ok' },
  { text: '', tone: 'spacer' },
  { text: 'Successfully installed aaron-altergott-1.0.0', tone: 'success' },
  { text: 'WARNING: Java not found. Continuing anyway.', tone: 'warning' },
] as const;

const PIP_STEP_MS = 235;
const PIP_INTERACTIVE_DELAY = 680;

const CORPORATE_RESPONSES = [
  'NOTE: Your inquiry has been triaged and forwarded to our synergy team. Expected response time: Q3 2027.',
  'LOGGED: Message received. Assigned priority P4 and archived in an unmonitored queue.',
  'NOTICE: Input acknowledged. Per our retention policy this has been escalated to 12 stakeholders.',
  'PROCESSED: Contribution noted, actioned, and immediately deprecated per company policy.',
  'ALERT: Your message triggered our high-value detection system. It has been thoroughly ignored.',
];

// ── Flight paths: [cp1xRatio, cp1yOffset, cp2xRatio, cp2yOffset] ─────────
const FLIGHT_PATHS: [number, number, number, number][] = [
  [0.30, -150, 0.70,  -70],
  [0.20, -230, 0.60, -150],
  [0.15,   55, 0.72,  -85],
  [0.40, -170, 0.88,  -25],
];

// ── Paper airplane ────────────────────────────────────────────────────────

interface FlightSpec {
  startX: number; startY: number;
  endX: number;   endY: number;
  pathIdx: number; key: number;
}

const PLANE_DURATION = 1600;

function PaperAirplane({ spec, onLand }: { spec: FlightSpec; onLand: () => void }) {
  const planeRef  = useRef<HTMLDivElement>(null);
  const trailRef  = useRef<SVGPathElement>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) return;
    const planeEl = plane;

    const { startX, startY, endX, endY, pathIdx } = spec;
    const dx = endX - startX;
    const dy = endY - startY;
    const fp = FLIGHT_PATHS[pathIdx % FLIGHT_PATHS.length]!;
    const [r1x, r1y, r2x, r2y] = fp;
    const cp1 = { x: startX + dx * r1x, y: startY + dy * 0.5 + r1y };
    const cp2 = { x: startX + dx * r2x, y: startY + dy * 0.5 + r2y };

    const startTime = performance.now();
    const trailPts: string[] = [];
    let rafId: number;

    function cubic(t: number, p0: number, p1: number, p2: number, p3: number) {
      const u = 1 - t;
      return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
    }

    function tick(now: number) {
      const raw = Math.min((now - startTime) / PLANE_DURATION, 1);
      const t   = raw < 0.5 ? 2*raw*raw : -1 + (4 - 2*raw)*raw;

      const x = cubic(t, startX, cp1.x, cp2.x, endX);
      const y = cubic(t, startY, cp1.y, cp2.y, endY);

      const nt = Math.min(t + 0.02, 1);
      const nx = cubic(nt, startX, cp1.x, cp2.x, endX);
      const ny = cubic(nt, startY, cp1.y, cp2.y, endY);
      const angle = Math.atan2(ny - y, nx - x) * 180 / Math.PI;

      // Fade into the can's mouth over the final 16% of travel
      const opacity = raw > 0.84 ? Math.max(0, 1 - (raw - 0.84) / 0.16) : 1;

      planeEl.style.left    = `${x - 10}px`;
      planeEl.style.top     = `${y - 8}px`;
      planeEl.style.transform = `rotate(${angle}deg)`;
      planeEl.style.opacity = String(opacity);

      // Trail stops before the final approach so it doesn't reach the can
      if (raw < 0.76) {
        trailPts.push(`${trailPts.length ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
        trailRef.current?.setAttribute('d', trailPts.join(''));
      }

      if (raw < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        const tr = trailRef.current;
        if (tr) { tr.style.transition = 'opacity 0.4s ease'; tr.style.opacity = '0'; }
        setTimeout(() => onLandRef.current(), 200);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // onLand intentionally excluded — stabilized via ref above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  return (
    <>
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998, overflow: 'visible' }}
      >
        <path ref={trailRef} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="3 6" />
      </svg>
      <div ref={planeRef} aria-hidden="true" style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999 }}>
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 8L18 1L14 15L10 9Z" fill="rgba(255,255,255,0.16)" stroke="white" strokeWidth="1.3" />
          <line x1="10" y1="9" x2="18" y2="1" stroke="white" strokeWidth="1.1" />
          <line x1="10" y1="9" x2="14" y2="15" stroke="white" strokeWidth="1.1" />
        </svg>
      </div>
    </>
  );
}

// ── Trash can ─────────────────────────────────────────────────────────────

function TrashCan({ visible, lidOpen, catching, lidClosing, canRef }: {
  visible: boolean; lidOpen: boolean; catching: boolean; lidClosing: boolean;
  canRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cls = ['pip-trash', visible && 'visible', lidOpen && 'lid-open', catching && 'catching', lidClosing && 'lid-closing']
    .filter(Boolean).join(' ');
  return (
    <div ref={canRef} className={cls} aria-hidden="true">
      <svg width="22" height="27" viewBox="0 0 22 27" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g className="trash-lid-group">
          <line x1="1" y1="9" x2="21" y2="9" stroke="var(--text-dim)" strokeWidth="1.3" />
          <path d="M8 6.5h6" stroke="var(--text-dim)" strokeWidth="1.3" />
        </g>
        <rect x="3" y="9" width="16" height="16" rx="2" stroke="var(--text-faint)" strokeWidth="1.1" />
        <line x1="8.5" y1="13" x2="8.5" y2="21" stroke="var(--text-faint)" strokeWidth="1" />
        <line x1="13.5" y1="13" x2="13.5" y2="21" stroke="var(--text-faint)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ── Pip card ──────────────────────────────────────────────────────────────

interface PipMsg { text: string; response: string; }

function SkillsPipCard({
  runId,
  onClose,
  onFlight,
  sendBtnRef,
}: {
  runId: number;
  onClose: () => void;
  onFlight: (btnRect: DOMRect, msgCount: number) => void;
  sendBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<'running' | 'interactive'>('running');
  const [messages, setMessages] = useState<PipMsg[]>([]);
  const [inputVal, setInputVal] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisibleLines(0);
    setPhase('running');
    setMessages([]);
    setInputVal('');

    const timers: ReturnType<typeof setTimeout>[] = [];
    PIP_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 260 + i * PIP_STEP_MS));
    });
    const total = 260 + (PIP_LINES.length - 1) * PIP_STEP_MS + PIP_INTERACTIVE_DELAY;
    timers.push(setTimeout(() => setPhase('interactive'), total));
    return () => timers.forEach(clearTimeout);
  }, [runId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleLines, messages]);

  useEffect(() => {
    if (phase === 'interactive') inputRef.current?.focus();
  }, [phase]);

  const handleSend = useCallback(() => {
    if (!inputVal.trim() || phase !== 'interactive') return;
    const text = inputVal.trim();
    const resp = CORPORATE_RESPONSES[messages.length % CORPORATE_RESPONSES.length];
    setMessages(prev => [...prev, { text, response: resp! }]);
    setInputVal('');
    if (sendBtnRef.current) onFlight(sendBtnRef.current.getBoundingClientRect(), messages.length);
  }, [inputVal, phase, messages, onFlight, sendBtnRef]);

  return (
    <div className="pip-card" role="region" aria-label="pip install terminal">
      <button className="pip-close" type="button" onClick={onClose} aria-label="Close terminal">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
        </svg>
      </button>

      <div className="pip-scroll" ref={scrollRef}>
        <pre className="pip-pre" aria-live="polite" aria-atomic="false">
          {PIP_LINES.slice(0, visibleLines).map((line, i) => (
            <span key={`${runId}-${i}`} className={`pip-line ${line.tone}`}>
              {line.text || ' '}
            </span>
          ))}
          {phase === 'running' && visibleLines > 0 && (
            <span className="pip-cursor" aria-hidden="true">_</span>
          )}
          {messages.map((msg, i) => (
            <span key={`msg-${i}`}>
              <span className="pip-line spacer">{' '}</span>
              <span className="pip-line command">&gt; {msg.text}</span>
              <span className="pip-line warning">{msg.response}</span>
            </span>
          ))}
        </pre>
      </div>

      <div className={`pip-input-row${phase === 'interactive' ? ' active' : ''}`}>
        <span className="pip-prompt" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="pip-input"
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="type something..."
          disabled={phase !== 'interactive'}
          aria-label="Terminal input"
        />
        <button
          ref={sendBtnRef}
          className="pip-send"
          type="button"
          onClick={handleSend}
          disabled={phase !== 'interactive' || !inputVal.trim()}
          aria-label="Send"
        >
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6.5L13 1L9.5 12L7 6.5Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="6.5" x2="13" y2="1" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────

function SkillsSection({ skills }: { skills: SkillGroup[] }) {
  const [selected, setSelected] = useState(skills[0]?.label ?? '');
  const [pipOpen, setPipOpen] = useState(false);
  const [pipRunId, setPipRunId] = useState(0);
  const [flight, setFlight] = useState<FlightSpec | null>(null);
  const [trashVisible, setTrashVisible] = useState(false);
  const [trashLidOpen, setTrashLidOpen] = useState(false);
  const [trashCatching, setTrashCatching] = useState(false);
  const [trashLidClosing, setTrashLidClosing] = useState(false);
  const systemRef   = useRef<HTMLDivElement>(null);
  const sendBtnRef  = useRef<HTMLButtonElement>(null);
  const trashCanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!skills.some((g) => g.label === selected)) setSelected(skills[0]?.label ?? '');
  }, [selected, skills]);

  useEffect(() => {
    if (!pipOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPipOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pipOpen]);

  const handleFlight = useCallback((btnRect: DOMRect, msgCount: number) => {
    const canEl = trashCanRef.current;
    if (!canEl) return;

    // Aim at the SVG's lid line — y=9 in the 27px-tall can SVG
    const cr   = canEl.getBoundingClientRect();
    const endX = cr.left + cr.width  / 2;
    const endY = cr.top  + 9;

    setTrashLidOpen(false);
    setTrashLidClosing(false);
    setTrashCatching(false);

    setFlight({
      startX: btnRect.left + btnRect.width  / 2,
      startY: btnRect.top  + btnRect.height / 2,
      endX, endY,
      pathIdx: msgCount % FLIGHT_PATHS.length,
      key: Date.now(),
    });
    setTrashVisible(true);

    // Lid swings open as plane approaches
    setTimeout(() => setTrashLidOpen(true), PLANE_DURATION - 500);

    // Plane is invisible at PLANE_DURATION → catching squash + glow
    setTimeout(() => {
      setTrashCatching(true);
      setTimeout(() => setTrashCatching(false), 520);
    }, PLANE_DURATION);

    // Lid snaps shut quickly after the plane enters
    setTimeout(() => {
      setTrashLidOpen(false);
      setTrashLidClosing(true);
    }, PLANE_DURATION + 180);

    // Plane element can be removed once trail has faded (~450ms)
    setTimeout(() => setFlight(null), PLANE_DURATION + 480);

    // Trash disappears after lid close animation (550ms)
    setTimeout(() => {
      setTrashLidClosing(false);
      setTrashVisible(false);
    }, PLANE_DURATION + 180 + 580);
  }, []);

  const closePip = useCallback(() => setPipOpen(false), []);

  const activeGroup = skills.find((g) => g.label === selected) ?? skills[0];
  const totalSkills = skills.reduce((t, g) => t + g.items.length, 0);

  const nodes = skills.map((group, index) => {
    const angle = -90 + (360 / Math.max(skills.length, 1)) * index;
    const rad   = (angle * Math.PI) / 180;
    const TARGET_GAP = 74;
    const CIRCLE_R   = 95;
    const ORBIT_HALF = 355;
    const CARD_W     = 230;
    const isMultiLine = group.label.length > 12;
    const focusCardH  = isMultiLine ? 81 : 58;
    const cosA = Math.abs(Math.cos(rad));
    const sinA = Math.abs(Math.sin(rad));
    const focusHalf = cosA > sinA ? CARD_W / 2 : focusCardH / 2;
    const focusR = ((TARGET_GAP + CIRCLE_R + focusHalf) / ORBIT_HALF) * 50;
    const x = 50 + Math.cos(rad) * focusR;
    const y = 50 + Math.sin(rad) * focusR;
    return { group, angle, x, y };
  });

  return (
    <section id="skills" className="section page-wrapper">
      <SectionHead title="Skills" />
      <div className={`skills-system${pipOpen ? ' pip-open' : ''}`} ref={systemRef}>

        <div className="skills-orbit" aria-label="Skill categories">
          <svg className="skills-orbit-lines" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="44" ry="31" className="skills-ring outer" />
            <ellipse cx="50" cy="50" rx="29" ry="20" className="skills-ring inner" />
            {nodes.map(({ group, x, y }, index) => (
              <line
                key={group.label}
                x1={x} y1={y} x2="50" y2="50"
                style={{ '--skill-vector-delay': `${index * 35}ms` } as CSSProperties}
                className={group.label === activeGroup?.label ? 'skill-vector active' : 'skill-vector'}
              />
            ))}
          </svg>

          <button
            className={pipOpen ? 'skills-core active' : 'skills-core'}
            type="button"
            aria-pressed={pipOpen}
            aria-label={pipOpen ? 'Close pip terminal' : 'Run pip install'}
            onClick={() => {
              if (pipOpen) { setPipOpen(false); }
              else { setPipRunId(r => r + 1); setPipOpen(true); }
            }}
          >
            <strong>{pipOpen ? 'pip' : totalSkills}</strong>
          </button>

          {nodes.map(({ group, angle, x, y }, index) => {
            const active = group.label === activeGroup?.label;
            return (
              <button
                key={group.label}
                type="button"
                className={active ? 'skill-node active' : 'skill-node'}
                style={{
                  '--skill-x': `${x}%`, '--skill-y': `${y}%`,
                  '--skill-angle': `${angle}deg`,
                  '--skill-delay': `${index * 55}ms`,
                } as CSSProperties}
                aria-pressed={active}
                onMouseEnter={() => setSelected(group.label)}
                onFocus={() => setSelected(group.label)}
                onClick={() => { setSelected(group.label); if (pipOpen) setPipOpen(false); }}
              >
                <span className="skill-node-top">
                  <span className="skill-node-count">/</span>
                  <span className="skill-node-label">{group.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <TrashCan visible={trashVisible} lidOpen={trashLidOpen} catching={trashCatching} lidClosing={trashLidClosing} canRef={trashCanRef} />

        {pipOpen ? (
          <SkillsPipCard
            runId={pipRunId}
            onClose={closePip}
            onFlight={handleFlight}
            sendBtnRef={sendBtnRef}
          />
        ) : (
          <aside className="skills-detail-panel" aria-live="polite">
            <h3>{activeGroup?.label}</h3>
            <ol className="skill-ledger">
              {activeGroup?.items.map((item, index) => (
                <li key={item} style={{ '--skill-delay': `${index * 35}ms` } as CSSProperties}>
                  <span>/</span>
                  <strong>{item}</strong>
                </li>
              ))}
            </ol>
          </aside>
        )}

        {flight && (
          <PaperAirplane key={flight.key} spec={flight} onLand={() => {}} />
        )}
      </div>
    </section>
  );
}

// ── Experience ────────────────────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
};

function UptimeChip({
  dates,
  startHour = 0,
  startMinute = 0,
  startSecond = 0,
}: {
  dates: string;
  startHour?: number;
  startMinute?: number;
  startSecond?: number;
}) {
  const startTime = useMemo(() => {
    const match = dates.match(/^([A-Za-z]+)\s+(\d{4})/);
    if (!match) return null;
    const month = MONTHS[match[1]!];
    if (month === undefined) return null;
    return new Date(parseInt(match[2]!), month, 1, startHour, startMinute, startSecond).getTime();
  }, [dates, startHour, startMinute, startSecond]);

  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!startTime) return;
    const compute = () => {
      const diff = Date.now() - startTime;
      const days = Math.floor(diff / 86400000);
      const rem = diff % 86400000;
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      const p = (n: number) => String(n).padStart(2, '0');
      setLabel(`${days}d ${p(h)}:${p(m)}:${p(s)}`);
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime || !label) return null;
  return (
    <span className="uptime-chip" aria-label={`Active for ${label}`}>
      {label}
    </span>
  );
}

function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="exp-item">
      <div className="exp-meta">
        <span className="exp-dates">{entry.dates}</span>
        {entry.dates.includes('Present') && (
          <UptimeChip
            dates={entry.dates}
            startHour={entry.startHour ?? 0}
            startMinute={entry.startMinute ?? 0}
            startSecond={entry.startSecond ?? 0}
          />
        )}
        <span className="exp-company">{entry.company}</span>
        <span className="exp-location">{entry.location}</span>
      </div>
      <div className="exp-body">
        <h3>{entry.role}</h3>
        <ul className="exp-bullets">
          {entry.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section id="experience" className="section page-wrapper">
      <SectionHead title="Experience" />
      <div className="exp-list">
        {experience.map((entry) => (
          <ExperienceItem key={entry.company + entry.role} entry={entry} />
        ))}
      </div>
    </section>
  );
}


// ── Contact ───────────────────────────────────────────────────────────────

function ContactSection({ person }: { person: Person }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    const didCopy = await copyTextToClipboard(person.email);
    if (!didCopy) return;

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="contact" className="section page-wrapper">
      <SectionHead title="Contact" />
      <div className="contact-content">
        <p className="contact-cta">
          Connect with me here:
        </p>
        <div className="contact-grid">
          <div className="contact-item">
            <span className="contact-item-label">Email</span>
            <span className="contact-email-row">
              <a href={`mailto:${person.email}`}>{person.email}</a>
              <button
                className={`hero-copy-btn${copied ? ' copied' : ''}`}
                type="button"
                aria-label={copied ? 'Copied!' : 'Copy email address'}
                onClick={copyEmail}
                style={{ opacity: 1, transform: 'none' }}
              >
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="2,7 5,10 11,3" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.2" />
                    <path d="M8 4.5V2.5a1 1 0 00-1-1H2.5a1 1 0 00-1 1V7a1 1 0 001 1H4.5" />
                  </svg>
                )}
              </button>
            </span>
          </div>
          <div className="contact-item">
            <span className="contact-item-label">GitHub</span>
            <a href={person.github} target="_blank" rel="noopener noreferrer">micronwave <span className="contact-ext-arrow" aria-hidden="true">↗</span></a>
          </div>
          <div className="contact-item">
            <span className="contact-item-label">LinkedIn</span>
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">aaronaltergott <span className="contact-ext-arrow" aria-hidden="true">↗</span></a>
          </div>
          <div className="contact-item">
            <span className="contact-item-label">Location</span>
            <span>{person.location}</span>
          </div>
        </div>
        <a className="resume-link" href={person.resumeUrl} download>
          Download Resume <span>↓</span>
        </a>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────

function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer page-wrapper">
      <span className="footer-text">{name} © {new Date().getFullYear()}</span>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────

interface Props {
  person: Person;
  about: About;
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certifications: Certification[];
  children?: ReactNode;
}

export default function PortfolioInterface({
  person,
  about,
  experience,
  skills,
  education,
  certifications,
  children,
}: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReducedMotion = () => setReducedMotion(media.matches);

    syncReducedMotion();
    setBackgroundReady(true);
    media.addEventListener('change', syncReducedMotion);

    return () => media.removeEventListener('change', syncReducedMotion);
  }, []);

  return (
    <>
      <GridBackground reducedMotion={reducedMotion} fadeIn={backgroundReady} />
      <main>
        <SiteNav name={person.name} />
        <HeroSection person={person} />
        <AboutSection
          about={about}
          person={person}
          education={education}
          certifications={certifications}
        />
        <SkillsSection skills={skills} />
        <ExperienceSection experience={experience} />
        {children}
        <ContactSection person={person} />
        <SiteFooter name={person.name} />
      </main>
    </>
  );
}

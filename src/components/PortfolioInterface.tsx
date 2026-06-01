import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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

const SiteNav = memo(function SiteNav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty('--scroll-progress', String(docHeight > 0 ? y / docHeight : 0));
    };
    onScroll();
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
          ref={progressRef}
          className="scroll-progress-bar"
          aria-hidden="true"
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
});

// ── Hero ──────────────────────────────────────────────────────────────────

const HeroSection = memo(function HeroSection({ person }: { person: Person }) {
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
});

// ── Section header ────────────────────────────────────────────────────────

const SectionHead = memo(function SectionHead({ title }: { title: string }) {
  const ref = useReveal();
  return (
    <div className="section-header reveal" ref={ref as React.RefObject<HTMLDivElement>}>
      <h2 className="section-title">{title}</h2>
    </div>
  );
});

// ── About ─────────────────────────────────────────────────────────────────

const AboutSection = memo(function AboutSection({
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
            <span className="detail-value">Cloud&nbsp;·&nbsp;Security&nbsp;·&nbsp;AI</span>
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
            <div className="detail-group detail-group-full" key={ed.institution}>
              <span className="detail-label">Education</span>
              <span className="detail-value">
                {ed.degree}, {ed.institution}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
});

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
  { text: 'Installing collected packages...', tone: 'status' },
  { text: 'Successfully installed aaron-altergott-1.0.0', tone: 'success' },
] as const;

const PIP_STEP_MS = 235;
const PIP_INTERACTIVE_DELAY = 680;

// ── Pip terminal types ────────────────────────────────────────────────────

type OutputTone = 'command' | 'status' | 'ok' | 'success' | 'warning' | 'spacer' | 'help-row';
interface OutputLine { text: string; tone: OutputTone; }
interface PipMsg {
  id: string;
  input: string;
  lines: OutputLine[];
  loading?: boolean;
}

interface Command {
  description: string;
  run: (args: string) => Promise<OutputLine[]>;
}

// ── Easter-egg lines ─────────────────────────────────────────────────────

const AARON_PACKAGE_LINES: OutputLine[] = PIP_LINES.map(l => ({ text: l.text, tone: l.tone as OutputTone }));

// ── PyPI helper ───────────────────────────────────────────────────────────

async function fetchPyPI(pkg: string): Promise<OutputLine[]> {
  if (!pkg) return [{ text: 'usage: pip install <package-name>', tone: 'warning' }];

  let res: Response;
  try {
    res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    return [{ text: 'ERROR: Could not connect to PyPI. Check your connection.', tone: 'warning' }];
  }

  if (res.status === 404) return [{ text: `ERROR: No matching distribution found for ${pkg}`, tone: 'warning' }];
  if (!res.ok) return [{ text: 'ERROR: Unexpected response from PyPI.', tone: 'warning' }];

  let data: { info: Record<string, unknown>; urls: Record<string, unknown>[] };
  try { data = await res.json(); } catch {
    return [{ text: 'ERROR: Unexpected response from PyPI.', tone: 'warning' }];
  }
  if (!data?.info || !Array.isArray(data?.urls)) {
    return [{ text: 'ERROR: Unexpected response from PyPI.', tone: 'warning' }];
  }

  const { info, urls } = data;
  const name = String(info['name'] ?? pkg);
  const version = String(info['version'] ?? '');
  const summary = String(info['summary'] ?? '');
  const author = String((info['author'] as string) || (info['maintainer'] as string) || '');
  const requiresPython = String(info['requires_python'] ?? '');
  const requiresDist = Array.isArray(info['requires_dist']) ? (info['requires_dist'] as string[]) : [];

  const sortedUrls = [...urls].sort((a, b) =>
    String(b['upload_time_iso_8601'] ?? '').localeCompare(String(a['upload_time_iso_8601'] ?? ''))
  );
  const latest = sortedUrls[0] ?? {};
  const released = String(latest['upload_time_iso_8601'] ?? '').slice(0, 10);
  const filename = String(latest['filename'] ?? '');
  const sizeBytes = typeof latest['size'] === 'number' ? (latest['size'] as number) : 0;
  const sizePart = sizeBytes ? ` (${(sizeBytes / 1_048_576).toFixed(1)} MB)` : '';

  const lines: OutputLine[] = [
    { text: `Collecting ${name}`, tone: 'command' },
    { text: `  Downloading ${filename}${sizePart}`.trimEnd(), tone: 'status' },
    { text: '', tone: 'spacer' },
    { text: 'Package metadata', tone: 'status' },
    { text: `  Name:         ${name}`, tone: 'ok' },
    { text: `  Version:      ${version}`, tone: 'ok' },
  ];
  if (summary) lines.push({ text: `  Summary:      ${summary}`, tone: 'ok' });
  if (author) lines.push({ text: `  Author:       ${author}`, tone: 'ok' });
  if (requiresPython) lines.push({ text: `  Requires:     Python ${requiresPython}`, tone: 'ok' });
  if (released) lines.push({ text: `  Released:     ${released}`, tone: 'ok' });

  if (requiresDist.length > 0) {
    const top5 = requiresDist.slice(0, 5);
    const extra = requiresDist.length - top5.length;
    lines.push({ text: '', tone: 'spacer' });
    lines.push({ text: `Dependencies (top ${Math.min(5, requiresDist.length)})`, tone: 'status' });
    top5.forEach(dep => lines.push({ text: `  ✓ ${dep}`, tone: 'ok' }));
    if (extra > 0) lines.push({ text: `  ... (${extra} more)`, tone: 'ok' });
  }

  lines.push({ text: '', tone: 'spacer' });
  lines.push({ text: `Successfully installed ${name}-${version}`, tone: 'success' });
  return lines;
}

// ── GitHub helper ─────────────────────────────────────────────────────────

async function fetchGitHub(handle: string): Promise<OutputLine[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  let userRes: Response, reposRes: Response;
  try {
    [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${handle}`, { headers }),
      fetch(`https://api.github.com/users/${handle}/repos?sort=updated&per_page=100`, { headers }),
    ]);
  } catch {
    return [{ text: 'ERROR: Could not reach GitHub API.', tone: 'warning' }];
  }

  const rateLimited = (s: number) => s === 403 || s === 429;
  if (rateLimited(userRes.status) || rateLimited(reposRes.status)) {
    const r = rateLimited(userRes.status) ? userRes : reposRes;
    const resetHeader = r.headers.get('x-ratelimit-reset');
    const lines: OutputLine[] = [{ text: 'ERROR: GitHub API rate limit exceeded.', tone: 'warning' }];
    if (resetHeader) {
      const resetTime = new Date(parseInt(resetHeader, 10) * 1000).toLocaleTimeString();
      lines.push({ text: `  Rate limit resets at: ${resetTime}`, tone: 'warning' });
    }
    return lines;
  }

  if (userRes.status === 404) return [{ text: 'ERROR: GitHub user not found.', tone: 'warning' }];
  if (!userRes.ok) return [{ text: 'ERROR: Could not reach GitHub API.', tone: 'warning' }];

  let user: Record<string, unknown>, repos: Record<string, unknown>[];
  try {
    [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
  } catch {
    return [{ text: 'ERROR: Unexpected response from GitHub API.', tone: 'warning' }];
  }
  if (!user || !Array.isArray(repos)) {
    return [{ text: 'ERROR: Unexpected response from GitHub API.', tone: 'warning' }];
  }

  const login = String(user['login'] ?? handle);
  const name = String(user['name'] ?? login);
  const publicRepos = (user['public_repos'] as number) ?? 0;
  const followers = (user['followers'] as number) ?? 0;
  const createdAt = String(user['created_at'] ?? '');
  const memberSince = createdAt ? new Date(createdAt).getFullYear() : null;
  const totalStars = repos.reduce((s, r) => s + (((r['stargazers_count'] as number) ?? 0)), 0);
  const topRepos = repos.slice(0, 5).map(r => ({
    name: String(r['name'] ?? ''),
    stars: (r['stargazers_count'] as number) ?? 0,
    lang: r['language'] ? String(r['language']) : null,
  }));
  const lastPushed = repos
    .map(r => String(r['pushed_at'] ?? ''))
    .filter(Boolean)
    .sort()
    .at(-1) ?? '';

  const lines: OutputLine[] = [
    { text: `GitHub profile — ${login}`, tone: 'status' },
    { text: '', tone: 'spacer' },
    { text: `  Name:         ${name}`, tone: 'ok' },
    { text: `  Repos:        ${publicRepos} public`, tone: 'ok' },
    { text: `  Stars:        ${totalStars} total`, tone: 'ok' },
    { text: `  Followers:    ${followers}`, tone: 'ok' },
  ];
  if (memberSince) lines.push({ text: `  Member since: ${memberSince}`, tone: 'ok' });
  if (lastPushed) lines.push({ text: `  Last push:    ${lastPushed.slice(0, 10)}`, tone: 'ok' });

  if (topRepos.length > 0) {
    lines.push({ text: '', tone: 'spacer' });
    lines.push({ text: 'Recent repositories', tone: 'status' });
    topRepos.forEach(({ name: rName, stars, lang }) => {
      const langPart = lang ? `(${lang})` : '';
      const starPart = stars > 0 ? `★ ${stars}` : '';
      lines.push({ text: [`  ✓ ${rName}`, langPart, starPart].filter(Boolean).join('  ').trimEnd(), tone: 'ok' });
    });
  }

  return lines;
}

// ── Pip line renderer ─────────────────────────────────────────────────────

function renderPipLine(tone: string, text: string): ReactNode {
  if (tone === 'command' && text.startsWith('> ')) {
    return <><span className="pip-prompt-char">{'>'}</span>{text.slice(1)}</>;
  }
  if (tone === 'help-row') {
    const pipeIdx = text.indexOf('|');
    const cmd  = pipeIdx >= 0 ? text.slice(0, pipeIdx) : text;
    const desc = pipeIdx >= 0 ? text.slice(pipeIdx + 1) : '';
    return <><span className="help-cmd">{cmd}</span><span className="help-desc">{desc}</span></>;
  }
  return text || ' ';
}

// ── Pip card ──────────────────────────────────────────────────────────────

function SkillsPipCard({
  runId,
  onClose,
  person,
  aboutSummary,
}: {
  runId: number;
  onClose: () => void;
  person: { name: string; email: string; github: string };
  aboutSummary: string[];
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<'running' | 'interactive'>('running');
  const [messages, setMessages] = useState<PipMsg[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setVisibleLines(0);
    setPhase('running');
    setMessages([]);
    setInputVal('');
    setHistory([]);
    setHistoryIdx(-1);

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

  const clearMessages = useCallback(() => setMessages([]), []);

  const commands = useMemo<Record<string, Command>>(() => ({
    help: {
      description: 'this menu',
      run: async () => [
        { text: 'Available commands:', tone: 'status' },
        { text: '', tone: 'spacer' },
        { text: 'pip install <pkg>|fetch real PyPI metadata', tone: 'help-row' },
        { text: 'github|live stats — repos, stars, activity', tone: 'help-row' },
        { text: 'about|who am I', tone: 'help-row' },
        { text: 'contact|how to reach me', tone: 'help-row' },
        { text: 'clear|clear terminal output', tone: 'help-row' },
        { text: 'help|this menu', tone: 'help-row' },
      ],
    },
    about: {
      description: 'who am I',
      run: async () => [
        { text: 'Director of Strategic Ambiguity & Dynamic Synthesis for Ecosystem Optimization,', tone: 'ok' as OutputTone },
        { text: 'specializing in heuristic community architecture and frictionless workplaces', tone: 'ok' as OutputTone },
      ],
    },
    sudo: {
      description: '',
      run: async () => [
        { text: 'aaron is not in the sudoers file.', tone: 'warning' as OutputTone },
        { text: 'This incident will be reported.', tone: 'warning' as OutputTone },
      ],
    },
    contact: {
      description: 'how to reach me',
      run: async () => [
        { text: `email:  ${person.email}`, tone: 'ok' },
        { text: `github: ${person.github}`, tone: 'ok' },
      ],
    },
    github: {
      description: 'live stats from GitHub (repos, stars, last push)',
      run: () => {
        const handle = person.github.split('/').filter(Boolean).at(-1) ?? 'micronwave';
        return fetchGitHub(handle);
      },
    },
    clear: {
      description: 'clear the terminal output',
      run: async () => { clearMessages(); return []; },
    },
    pip: {
      description: 'fetch real PyPI metadata for any package',
      run: async (args: string) => {
        const [sub = '', ...pkgTokens] = args.trim().split(/\s+/);
        if (sub.toLowerCase() !== 'install') {
          return [{ text: `pip: unknown command '${sub || '(none)'}'`, tone: 'warning' as OutputTone }];
        }
        const pkg = pkgTokens.join(' ').trim();
        if (pkg.toLowerCase() === 'aaron-altergott') return AARON_PACKAGE_LINES;
        return fetchPyPI(pkg);
      },
    },
  }), [person, aboutSummary, clearMessages]);

  const hasLoading = messages.some(m => m.loading);

  const handleSend = useCallback(async () => {
    if (!inputVal.trim() || phase !== 'interactive' || hasLoading) return;
    const raw = inputVal.trim();
    const [cmdToken = '', ...rest] = raw.split(/\s+/);
    const cmd = cmdToken.toLowerCase();
    const args = rest.join(' ');

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pending: PipMsg = { id, input: raw, lines: [], loading: true };
    setMessages(prev => [...prev, pending]);
    setInputVal('');
    setHistory(prev => [raw, ...prev]);
    setHistoryIdx(-1);

    const command = commands[cmd];
    if (!command) {
      setMessages(prev => prev.map(m => m.id === id
        ? { ...m, lines: [{ text: `command not found: ${raw}. Type 'help' to see available commands.`, tone: 'warning' as OutputTone }], loading: false }
        : m
      ));
      return;
    }

    try {
      const lines = await command.run(args);
      if (!mountedRef.current) return;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, lines, loading: false } : m));
    } catch {
      if (!mountedRef.current) return;
      setMessages(prev =>
        prev.map(m => m.id === id
          ? { ...m, lines: [{ text: 'ERROR: command failed.', tone: 'warning' as OutputTone }], loading: false }
          : m
        )
      );
    }
  }, [inputVal, phase, commands, hasLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSend(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInputVal(history[next] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx <= 0) { setHistoryIdx(-1); setInputVal(''); return; }
      const next = historyIdx - 1;
      setHistoryIdx(next);
      setInputVal(history[next] ?? '');
    }
  }, [handleSend, history, historyIdx]);

  return (
    <div className="pip-card" role="region" aria-label="pip install terminal">
      <div className="pip-titlebar">
<span className="pip-title" aria-hidden="true">pip ~ aaron-altergott</span>
        <button className="pip-close" type="button" onClick={onClose} aria-label="Close terminal">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>
      </div>

      <div className="pip-scroll" ref={scrollRef}>
        <pre className="pip-pre" aria-live="polite" aria-atomic="false">
          {PIP_LINES.slice(0, visibleLines).map((line, i) => (
            <span key={`${runId}-${i}`} className={`pip-line ${line.tone}`}>
              {renderPipLine(line.tone, line.text)}
              {i === visibleLines - 1 && phase === 'running' && (
                <span className="pip-cursor" aria-hidden="true">_</span>
              )}
            </span>
          ))}
          {messages.map((msg) => (
            <span key={msg.id}>
              <span className="pip-line spacer">{' '}</span>
              <span className="pip-line command"><span className="pip-prompt-char">{'>'}</span>{' '}{msg.input}</span>
              {msg.loading
                ? <span className="pip-line status">loading<span className="pip-cursor">_</span></span>
                : msg.lines.map((l, j) => (
                    <span key={j} className={`pip-line ${l.tone}`}>
                      {renderPipLine(l.tone, l.text)}
                    </span>
                  ))
              }
            </span>
          ))}
        </pre>
      </div>

      <div className="pip-input-row">
        <span className="pip-prompt" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="pip-input"
          type="text"
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setHistoryIdx(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="try: help, pip install <pkg>, github"
          disabled={phase !== 'interactive' || hasLoading}
          aria-label="Terminal input"
        />
        <button
          className="pip-send"
          type="button"
          onClick={() => { handleSend(); }}
          disabled={phase !== 'interactive' || !inputVal.trim() || hasLoading}
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

const SkillsSection = memo(function SkillsSection({ skills, person, about }: { skills: SkillGroup[]; person: Person; about: About }) {
  const [selected, setSelected] = useState(skills[0]?.label ?? '');
  const [pipOpen, setPipOpen] = useState(false);
  const [pipRunId, setPipRunId] = useState(0);
  const systemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!skills.some((g) => g.label === selected)) setSelected(skills[0]?.label ?? '');
  }, [selected, skills]);

  useEffect(() => {
    if (!pipOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPipOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pipOpen]);

  const closePip = useCallback(() => setPipOpen(false), []);

  const activeGroup = skills.find((g) => g.label === selected) ?? skills[0];

  const nodes = useMemo(() => skills.map((group, index) => {
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
  }), [skills]);

  return (
    <section id="skills" className="section page-wrapper">
      <SectionHead title="Skills" />
      <div className={`skills-system${pipOpen ? ' pip-open' : ''}`} ref={systemRef}>

        <div className="skills-orbit" aria-label="Skill categories">
          <svg className="skills-orbit-lines" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="44" ry="31" className="skills-ring outer" />
            <ellipse cx="50" cy="50" rx="29" ry="20" className="skills-ring inner" />
            {nodes.map(({ group, x, y }, index) => {
              const dx = x - 50;
              const x2 = Math.abs(dx) > 1 ? (dx < 0 ? 35 : 65) : 50;
              const y2 = Math.abs(dx) > 1 ? 50 : (y < 50 ? 45 : 55);
              return (
                <line
                  key={group.label}
                  x1={x} y1={y} x2={x2} y2={y2}
                  style={{ '--skill-vector-delay': `${index * 35}ms` } as CSSProperties}
                  className={group.label === activeGroup?.label ? 'skill-vector active' : 'skill-vector'}
                />
              );
            })}
          </svg>

          <button
            className={`skills-rocker${pipOpen ? ' active' : ''}`}
            type="button"
            role="switch"
            aria-checked={pipOpen}
            aria-label={pipOpen ? 'Switch to browse mode' : 'Switch to run mode'}
            onClick={() => {
              if (pipOpen) { setPipOpen(false); }
              else { setPipRunId(r => r + 1); setPipOpen(true); }
            }}
          >
            <span className="skills-rocker-label left" aria-hidden="true">browse</span>
            <span className="skills-rocker-label right" aria-hidden="true">run</span>
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

        {pipOpen ? (
          <SkillsPipCard
            runId={pipRunId}
            onClose={closePip}
            person={{ name: person.name, email: person.email, github: person.github }}
            aboutSummary={about.summary}
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

      </div>
    </section>
  );
});

// ── Experience ────────────────────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
};

let currentSecond = Date.now();
let uptimeInterval: ReturnType<typeof setInterval> | null = null;
const uptimeListeners = new Set<() => void>();

function subscribeToUptime(listener: () => void) {
  uptimeListeners.add(listener);
  if (!uptimeInterval) {
    uptimeInterval = setInterval(() => {
      currentSecond = Date.now();
      uptimeListeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    uptimeListeners.delete(listener);
    if (uptimeListeners.size === 0 && uptimeInterval) {
      clearInterval(uptimeInterval);
      uptimeInterval = null;
    }
  };
}

const getCurrentSecond = () => currentSecond;
const getServerSecond = () => 0;

const UptimeChip = memo(function UptimeChip({
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
  const now = useSyncExternalStore(subscribeToUptime, getCurrentSecond, getServerSecond);
  const startTime = useMemo(() => {
    const match = dates.match(/^([A-Za-z]+)\s+(\d{4})/);
    if (!match) return null;
    const month = MONTHS[match[1]!];
    if (month === undefined) return null;
    return new Date(parseInt(match[2]!), month, 1, startHour, startMinute, startSecond).getTime();
  }, [dates, startHour, startMinute, startSecond]);

  const label = useMemo(() => {
    if (!startTime || now === 0) return;
    const diff = now - startTime;
    const days = Math.floor(diff / 86400000);
    const rem = diff % 86400000;
    const h = Math.floor(rem / 3600000);
    const m = Math.floor((rem % 3600000) / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${days}d ${p(h)}:${p(m)}:${p(s)}`;
  }, [now, startTime]);

  if (!startTime || !label) return null;
  return (
    <span className="uptime-chip" aria-label={`Active for ${label}`}>
      {label}
    </span>
  );
});

const ExperienceItem = memo(function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
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
});

const ExperienceSection = memo(function ExperienceSection({ experience }: { experience: ExperienceEntry[] }) {
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
});


// ── Contact ───────────────────────────────────────────────────────────────

const ContactSection = memo(function ContactSection({ person }: { person: Person }) {
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
});

// ── Footer ────────────────────────────────────────────────────────────────

const SiteFooter = memo(function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer page-wrapper">
      <span className="footer-text">{name} © {new Date().getFullYear()}</span>
    </footer>
  );
});

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
        <SkillsSection skills={skills} person={person} about={about} />
        <ExperienceSection experience={experience} />
        {children}
        <ContactSection person={person} />
        <SiteFooter name={person.name} />
      </main>
    </>
  );
}

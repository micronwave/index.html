import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
      // Huge top margin: anything at or above the viewport counts as already
      // seen, so instant jumps (End key, scrollbar drag, Ctrl+F) don't leave
      // skipped-over headings stuck at opacity 0. Reveal-on-scroll-down is
      // unchanged — elements below still have to enter normally.
      { threshold, rootMargin: '100000px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Nav ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '#about', label: 'about' },
  { href: '#skills', label: 'skills' },
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`} aria-label="Site navigation">
        <span className="nav-name">{name}</span>

        <ul className="nav-links" aria-hidden={menuOpen}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>

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
        I build automations that cut manual work and protect revenue.
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

// ── Skills ────────────────────────────────────────────────────────────────

const SKILL_CONFIG: Record<string, { color: string; anchors: string[] }> = {
  'Cloud':   { color: 'var(--green)', anchors: ['AWS (Bedrock, Lambda, S3, CloudFront, API Gateway, IAM, CloudWatch, CLI)'] },
  'AI / ML': { color: '#6e8d3f', anchors: ['RAG', 'Semantic Search', 'Embeddings'] },
  'Backend': { color: '#a09b3c', anchors: ['Python', 'SQL', 'REST APIs'] },
  'Tools':   { color: '#c4a648', anchors: ['HubSpot', 'Retool', 'n8n'] },
  'Ops':     { color: '#d4a855', anchors: ['LLM ops', 'Financial ops', 'Competitive analysis'] },
};

const SkillsSection = memo(function SkillsSection({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="skills" className="section page-wrapper">
      <SectionHead title="Skills" />
      <div className="skills-table">
        {skills.map((group) => {
          const cfg = SKILL_CONFIG[group.label] ?? { color: 'var(--green)', anchors: [] };
          return (
            <div key={group.label} className="skills-row" style={{ '--row-color': cfg.color } as CSSProperties}>
              <span className="skills-row-label">{group.label}</span>
              <p className="skills-row-items">
                {group.items.map((item, i) => (
                  <span key={item}>
                    {i > 0 && <span className="skills-sep"> · </span>}
                    <span className={cfg.anchors.includes(item) ? 'skills-item skills-item--anchor' : 'skills-item'}>
                      {item}
                    </span>
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
});

// ── Experience ────────────────────────────────────────────────────────────

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

const UptimeChip = memo(function UptimeChip({ startDate }: { startDate: string }) {
  const now = useSyncExternalStore(subscribeToUptime, getCurrentSecond, getServerSecond);
  const startTime = useMemo(() => {
    const time = new Date(startDate).getTime();
    return Number.isNaN(time) ? null : time;
  }, [startDate]);

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
        {entry.dates.includes('Present') && entry.startDate && (
          <UptimeChip startDate={entry.startDate} />
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
      <SiteNav name={person.name} />
      <main>
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
      </main>
      <SiteFooter name={person.name} />
    </>
  );
}

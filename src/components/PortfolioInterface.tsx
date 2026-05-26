import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type {
  Person,
  About,
  ExperienceEntry,
  Project,
  SkillGroup,
  EducationEntry,
  Certification,
} from '../data/content';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  return (
    <section className="hero page-wrapper" aria-label="Introduction">
      <h1 aria-label={person.name}>
        {firstName}
        <br />
        <em>{lastName}</em>
      </h1>
      <p className="hero-sub">
        Operations engineer who automates what others accept as manual.
        Cloud, security, and AI — three layers that depend on each other.
      </p>
      <div className="hero-links">
        <a className="hero-link" href={person.github} target="_blank" rel="noopener noreferrer">
          GitHub <span className="arrow">→</span>
        </a>
        <a className="hero-link" href={person.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn <span className="arrow">→</span>
        </a>
        <span className={`hero-email${showEmail ? ' visible' : ''}`}>
          <button
            className="hero-link"
            type="button"
            aria-expanded={showEmail}
            aria-controls="hero-email-address"
            onClick={() => setShowEmail((visible) => !visible)}
          >
            Email <span className="arrow">→</span>
          </button>
          <span id="hero-email-address" className="hero-email-address" aria-hidden={!showEmail}>
            {person.email}
          </span>
        </span>
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
  const ref = useReveal();
  return (
    <section id="about" className="section page-wrapper">
      <SectionHead title="About" />
      <div className="about-content reveal" ref={ref as React.RefObject<HTMLDivElement>}>
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
                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">
                    {cert.name.replace(' (CLF-C02)', '')}
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

// ── Skills ────────────────────────────────────────────────────────────────

function SkillsSection({ skills }: { skills: SkillGroup[] }) {
  const [selected, setSelected] = useState(skills[0]?.label ?? '');
  const [viewMode, setViewMode] = useState<'focus' | 'all'>('focus');

  useEffect(() => {
    if (!skills.some((group) => group.label === selected)) {
      setSelected(skills[0]?.label ?? '');
    }
  }, [selected, skills]);

  useEffect(() => {
    if (viewMode !== 'all') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewMode('focus');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode]);

  const activeGroup = skills.find((group) => group.label === selected) ?? skills[0];
  const totalSkills = skills.reduce((total, group) => total + group.items.length, 0);
  const nodes = skills.map((group, index) => {
    const angle = -90 + (360 / Math.max(skills.length, 1)) * index;
    const rad = (angle * Math.PI) / 180;
    const radius = 36;
    const x = 50 + Math.cos(rad) * radius;
    const y = 50 + Math.sin(rad) * radius;
    return { group, angle, x, y };
  });

  return (
    <section id="skills" className="section page-wrapper">
      <SectionHead title="Skills" />
      <div
        className={`skills-system${viewMode === 'all' ? ' atlas-open' : ''}`}
      >
        <div className="skills-orbit" aria-label="Skill categories">
          <svg className="skills-orbit-lines" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="41" className="skills-ring outer" />
            <circle cx="50" cy="50" r="27" className="skills-ring inner" />
            {nodes.map(({ group, x, y }, index) => (
              <line
                key={group.label}
                x1={x}
                y1={y}
                x2="50"
                y2="50"
                style={{ '--skill-vector-delay': `${index * 35}ms` } as CSSProperties}
                className={
                  viewMode === 'all' || group.label === activeGroup?.label
                    ? 'skill-vector active'
                    : 'skill-vector'
                }
              />
            ))}
          </svg>

          <button
            className={viewMode === 'all' ? 'skills-core active' : 'skills-core'}
            type="button"
            aria-pressed={viewMode === 'all'}
            aria-label={viewMode === 'all' ? 'Collapse skill categories' : 'Expand all skill categories'}
            onClick={() => setViewMode((mode) => (mode === 'all' ? 'focus' : 'all'))}
          >
            <span>{viewMode === 'all' ? 'Expanded' : 'Systems'}</span>
            <strong>{viewMode === 'all' ? 'All' : totalSkills}</strong>
            <small>{viewMode === 'all' ? 'skills visible' : 'working skills'}</small>
          </button>

          {nodes.map(({ group, angle, x, y }, index) => {
            const active = group.label === activeGroup?.label;
            const nodeStyle = {
              '--skill-x': `${x}%`,
              '--skill-y': `${y}%`,
              '--skill-angle': `${angle}deg`,
              '--skill-delay': `${index * 55}ms`,
            } as CSSProperties;

            return (
              <button
                key={group.label}
                type="button"
                className={active ? 'skill-node active' : 'skill-node'}
                style={nodeStyle}
                aria-pressed={active}
                onMouseEnter={() => setSelected(group.label)}
                onFocus={() => setSelected(group.label)}
                onClick={() => {
                  setSelected(group.label);
                  setViewMode('focus');
                }}
              >
                <span className="skill-node-count">/</span>
                <span className="skill-node-label">{group.label}</span>
                <span className="skill-node-map" aria-hidden={viewMode !== 'all'}>
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <aside
          className={`skills-detail-panel${viewMode === 'all' ? ' returning' : ''}`}
          aria-hidden={viewMode === 'all'}
          aria-live={viewMode === 'all' ? 'off' : 'polite'}
        >
          <h3>{activeGroup?.label}</h3>
          <ol className="skill-ledger">
            {activeGroup?.items.map((item, index) => (
              <li
                key={item}
                style={{ '--skill-delay': `${index * 35}ms` } as CSSProperties}
              >
                <span>/</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

// ── Experience ────────────────────────────────────────────────────────────

function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  const ref = useReveal();
  return (
    <div className="exp-item reveal" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="exp-meta">
        <span className="exp-dates">{entry.dates}</span>
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
        <div className="exp-tags">
          {entry.tags.map((tag) => (
            <span className="exp-tag" key={tag}>{tag}</span>
          ))}
        </div>
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

// ── Projects ──────────────────────────────────────────────────────────────

function ProjectItem({ project }: { project: Project }) {
  const ref = useReveal();
  return (
    <div className="project-item reveal" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="project-top">
        <span className="project-name">{project.name}</span>
        <span className={`project-status ${project.status}`}>{project.status}</span>
      </div>
      <p className="project-tagline">{project.tagline}</p>
      <ul className="project-bullets">
        {project.bullets.slice(0, 3).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="project-footer">
        <div className="project-stack">
          {project.stack.map((s) => (
            <span className="stack-chip" key={s}>{s}</span>
          ))}
        </div>
        {(project.githubUrl || project.liveUrl) && (
          <div className="project-links">
            {project.githubUrl && (
              <a className="project-link" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                Source <span className="arrow">→</span>
              </a>
            )}
            {project.liveUrl && (
              <a className="project-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Live <span className="arrow">→</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="section page-wrapper">
      <SectionHead title="Projects" />
      <div className="projects-list">
        {projects.map((project) => (
          <ProjectItem key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────

function ContactSection({ person }: { person: Person }) {
  const ref = useReveal();
  return (
    <section id="contact" className="section page-wrapper">
      <SectionHead title="Contact" />
      <div className="contact-content reveal" ref={ref as React.RefObject<HTMLDivElement>}>
        <p className="contact-cta">
          Interested in working together?<br />Find me here:
        </p>
        <div className="contact-grid">
          <div className="contact-item">
            <span className="contact-item-label">Email</span>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </div>
          <div className="contact-item">
            <span className="contact-item-label">GitHub</span>
            <a href={person.github} target="_blank" rel="noopener noreferrer">micronwave</a>
          </div>
          <div className="contact-item">
            <span className="contact-item-label">LinkedIn</span>
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">aaronaltergott</a>
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
  projects: Project[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certifications: Certification[];
}

export default function PortfolioInterface({
  person,
  about,
  experience,
  projects,
  skills,
  education,
  certifications,
}: Props) {
  return (
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
      <ProjectsSection projects={projects} />
      <ContactSection person={person} />
      <SiteFooter name={person.name} />
    </main>
  );
}

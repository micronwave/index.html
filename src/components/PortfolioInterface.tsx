import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  About,
  Certification,
  EducationEntry,
  ExperienceEntry,
  Person,
  Project,
} from '../data/content';
import AboutSection from './sections/AboutSection';
import ContactSection from './sections/ContactSection';
import EducationSection from './sections/EducationSection';
import ExperienceSection from './sections/ExperienceSection';
import ProjectsSection from './sections/ProjectsSection';
import GridBackground from './GridBackground';
import ParticleName from './ParticleName';

type PanelKey = 'about' | 'experience' | 'projects' | 'education' | 'contact';

interface PortfolioInterfaceProps {
  person: Person;
  about: About;
  experience: ExperienceEntry[];
  projects: Project[];
  education: EducationEntry[];
  certifications: Certification[];
}

const navPanels: Array<{ key: PanelKey; label: string }> = [
  { key: 'about', label: 'About / Background' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'education', label: 'Education' },
  { key: 'contact', label: 'Contact' },
];

const panelTitles: Record<PanelKey, string> = {
  about: 'About / Background',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  contact: 'Contact',
};

const nodeIntroDelays = [0.3, 0.4, 0.5, 0.6, 0.7];

function normalizeHash(hash: string): PanelKey | null {
  const key = hash.replace('#', '');
  return ['about', 'experience', 'projects', 'education', 'contact'].includes(key)
    ? (key as PanelKey)
    : null;
}

export default function PortfolioInterface({
  person,
  about,
  experience,
  projects,
  education,
  certifications,
}: PortfolioInterfaceProps) {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);

  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const introPlayedRef = useRef(false);

  useEffect(() => {
    introPlayedRef.current = introPlayed;
  }, [introPlayed]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const initialPanel = normalizeHash(window.location.hash);
    if (initialPanel) setActivePanel(initialPanel);

    const handleHashChange = () => setActivePanel(normalizeHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || window.location.hash) {
      setIntroPlayed(true);
      return;
    }
    const id = requestAnimationFrame(() => setIntroPlayed(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  useEffect(() => {
    if (!activePanel) {
      lastTriggerRef.current?.focus();
      return;
    }
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel]);

  function openPanel(panel: PanelKey, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setActivePanel(panel);
    window.history.replaceState(null, '', `#${panel}`);
  }

  function closePanel() {
    setActivePanel(null);
    window.history.replaceState(null, '', window.location.pathname);
  }

  const rm = reducedMotion;

  return (
    <main className="interface-shell">
      <GridBackground reducedMotion={reducedMotion} fadeIn={introPlayed} />

      <section
        ref={stageRef}
        className={`orbit-stage${activePanel ? ' panel-open' : ''}`}
        aria-label="Portfolio sections"
      >
        {/* Column 1: Navigation sidebar */}
        <nav className="nav-rail" aria-label="Navigation">
          {navPanels.map((panel, idx) => (
            <motion.button
              key={panel.key}
              className={`orbit-node${activePanel === panel.key ? ' orbit-node-active' : ''}`}
              type="button"
              ref={(el: HTMLButtonElement | null) => {
                if (el) {
                  nodeRefs.current.set(panel.key, el);
                  el.style.setProperty('view-transition-name', `orbit-${panel.key}`);
                }
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (activePanel === panel.key) {
                  closePanel();
                } else {
                  openPanel(panel.key, e.currentTarget);
                }
              }}
              aria-expanded={activePanel === panel.key}
              aria-controls="content-region"
              initial={{ x: -24, opacity: 0 }}
              animate={introPlayed ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
              transition={
                rm
                  ? { duration: 0.001 }
                  : { type: 'spring', stiffness: 160, damping: 22, delay: nodeIntroDelays[idx] ?? 0.5 }
              }
              {...(rm
                ? {}
                : {
                    whileHover: { x: 4, transition: { type: 'spring', stiffness: 400, damping: 28 } },
                    whileFocus: { x: 4, transition: { type: 'spring', stiffness: 400, damping: 28 } },
                  })}
            >
              <span>{panel.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Column 2: Embedded content area */}
        <div className="content-column" id="content-region">
          <AnimatePresence>
            {activePanel && (
              <motion.section
                key={activePanel}
                className="content-panel"
                aria-labelledby="panel-title"
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.985,
                  transition: rm ? { duration: 0.001 } : { duration: 0.2, ease: 'easeIn' },
                }}
                transition={rm ? { duration: 0.001 } : { type: 'spring', stiffness: 280, damping: 30 }}
              >
                <div className="panel-chrome">
                  <motion.h2
                    id="panel-title"
                    initial={{ y: -8, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: rm ? { duration: 0.001 } : { delay: 0.1, duration: 0.3 },
                    }}
                    exit={{
                      y: -4,
                      opacity: 0,
                      transition: rm ? { duration: 0.001 } : { duration: 0.12 },
                    }}
                  >
                    {panelTitles[activePanel]}
                  </motion.h2>
                  <motion.button
                    className="close-button"
                    type="button"
                    onClick={closePanel}
                    ref={closeButtonRef}
                    aria-label="Close panel"
                    initial={{ x: 12, opacity: 0 }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      transition: rm ? { duration: 0.001 } : { delay: 0.1, duration: 0.25 },
                    }}
                    exit={{
                      x: 8,
                      opacity: 0,
                      transition: rm ? { duration: 0.001 } : { duration: 0.12 },
                    }}
                  >
                    ×
                  </motion.button>
                </div>
                <motion.div
                  className="overlay-content"
                  data-section={activePanel}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: rm ? { duration: 0.001 } : { delay: 0.16, duration: 0.3 },
                  }}
                  exit={{
                    y: 6,
                    opacity: 0,
                    transition: rm ? { duration: 0.001 } : { duration: 0.12, ease: 'easeOut' },
                  }}
                >
                  {activePanel === 'about' && <AboutSection about={about} />}
                  {activePanel === 'experience' && <ExperienceSection experience={experience} />}
                  {activePanel === 'projects' && <ProjectsSection projects={projects} />}
                  {activePanel === 'education' && (
                    <EducationSection education={education} certifications={certifications} />
                  )}
                  {activePanel === 'contact' && <ContactSection person={person} />}
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Identity hub */}
        <div ref={centerRef} className={`center-hub${activePanel ? ' panel-open' : ''}`}>
          <ParticleName reducedMotion={reducedMotion} panelOpen={Boolean(activePanel)} />
          <motion.h1
            ref={h1Ref}
            className="sr-name"
            initial={{ y: -14, opacity: 0 }}
            animate={introPlayed ? { y: 0, opacity: 0 } : { y: -14, opacity: 0 }}
            transition={
              rm
                ? { duration: 0.001 }
                : { type: 'spring', stiffness: 120, damping: 18, delay: 0.15 }
            }
          >
            {person.name}
          </motion.h1>
          <motion.p
            className="hub-tagline"
            initial="hidden"
            animate={introPlayed ? 'visible' : 'hidden'}
            variants={{
              hidden: {},
              visible: {
                transition: rm
                  ? { staggerChildren: 0 }
                  : { staggerChildren: 0.08, delayChildren: 1.4 },
              },
            }}
          >
            {person.tagline.split(' ').map((word, wi, words) => (
              <motion.span
                key={`${word}-${wi}`}
                variants={{
                  hidden: { y: 8, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                transition={rm ? { duration: 0.001 } : { duration: 0.35, ease: 'easeOut' }}
              >
                {word}
                {wi < words.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.p>
          <div className="game-zone" aria-hidden="true" />
        </div>
      </section>

      {/* Panel backdrop — mobile only, click to close */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            key="panel-backdrop"
            className="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: rm ? { duration: 0.001 } : { duration: 0.18 } }}
            transition={rm ? { duration: 0.001 } : { duration: 0.2 }}
            onClick={closePanel}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </main>
  );
}

import type { ExperienceEntry } from '../../data/content';

interface ExperienceSectionProps {
  experience: ExperienceEntry[];
}

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section id="experience" className="portfolio-section">
      <div className="card-grid">
        {experience.map((entry) => (
          <article className="content-card" key={`${entry.company}-${entry.role}`}>
            <div className="card-heading">
              <h3>{entry.role}</h3>
              <p className="meta-line">
                {entry.company} · {entry.location} · {entry.dates}
              </p>
            </div>
            <ul className="bullet-list">
              {entry.bullets.slice(0, 5).map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="chip-row" aria-label={`${entry.role} tags`}>
              {entry.tags.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

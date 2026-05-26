import type { Certification, EducationEntry } from '../../data/content';

interface EducationSectionProps {
  education: EducationEntry[];
  certifications: Certification[];
}

export default function EducationSection({ education, certifications }: EducationSectionProps) {
  return (
    <section id="education" className="portfolio-section">
      <div className="split-grid">
        <div className="content-card">
          {education.map((entry) => (
            <article className="education-entry" key={entry.institution}>
              <h3>{entry.institution}</h3>
              <p className="meta-line">
                {entry.degree} · {entry.dates}
              </p>
              {entry.notes && <p className="tagline-text">{entry.notes}</p>}
            </article>
          ))}
        </div>
        <div className="content-card">
          <h3 className="subsection-title">Certifications</h3>
          <div className="certification-list">
            {certifications.map((certification) => (
              <article className="certification-entry" key={certification.name}>
                <h4>{certification.name}</h4>
                <p className="meta-line">
                  {certification.issuer} · {certification.issued}
                </p>
                {certification.verifyUrl && (
                  <a
                    className="inline-link"
                    href={certification.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verify
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

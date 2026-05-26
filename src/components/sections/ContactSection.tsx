import type { Person } from '../../data/content';

interface ContactSectionProps {
  person: Person;
}

export default function ContactSection({ person }: ContactSectionProps) {
  return (
    <section id="contact" className="portfolio-section">
      <div className="contact-grid">
        <a className="contact-link" href={`mailto:${person.email}`}>
          <span>Email</span>
          <strong>{person.email}</strong>
        </a>
        <a
          className="contact-link"
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>LinkedIn</span>
          <strong>aaronaltergott</strong>
        </a>
        <a
          className="contact-link"
          href={person.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>GitHub</span>
          <strong>micronwave</strong>
        </a>
        <a className="contact-link" href={person.resumeUrl} download>
          <span>Resume</span>
          <strong>Download PDF</strong>
        </a>
      </div>
    </section>
  );
}

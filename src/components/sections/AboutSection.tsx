import type { About } from '../../data/content';

interface AboutSectionProps {
  about: About;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section id="about" className="portfolio-section">
      {about.summary.map((para, i) => (
        <p key={i} className="about-summary">{para}</p>
      ))}
    </section>
  );
}

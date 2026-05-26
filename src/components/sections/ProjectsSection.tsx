import type { Project } from '../../data/content';

interface ProjectsSectionProps {
  projects: Project[];
}

const statusLabels: Record<Project['status'], string> = {
  active: 'Active',
  complete: 'Complete',
  prototype: 'Prototype',
  archived: 'Archived',
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="portfolio-section">
      <div className="card-grid">
        {projects.map((project) => (
          <article className="content-card project-card" key={project.name}>
            <span className={`status-badge status-${project.status}`}>
              {statusLabels[project.status]}
            </span>
            <div className="card-heading">
              <h3>{project.name}</h3>
              <p className="tagline-text">{project.tagline}</p>
            </div>
            <ul className="bullet-list">
              {project.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="chip-row" aria-label={`${project.name} stack`}>
              {project.stack.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            {(project.githubUrl || project.liveUrl) && (
              <div className="link-row">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    View Source
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live Demo
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

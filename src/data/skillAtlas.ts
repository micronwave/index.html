import type { Project, SkillGroup } from './content';

export type SkillCapability = 'ship' | 'retrieve' | 'model' | 'operate';

interface SkillEvidence {
  capability: SkillCapability;
  projects: string[];
}

export interface SkillAtlasToken {
  item: string;
  group: string;
  proofCount: number;
  projects: string[];
}

export interface SkillAtlasRow {
  id: SkillCapability;
  label: string;
  description: string;
  skills: SkillAtlasToken[];
}

export interface ProjectSkillEvidence {
  name: string;
  tagline: string;
  skills: string[];
}

export interface SkillAtlasData {
  provenSkillCount: number;
  totalSkillCount: number;
  rows: SkillAtlasRow[];
  unmappedSkills: SkillAtlasToken[];
  projects: ProjectSkillEvidence[];
}

const CAPABILITY_ROWS: Array<{
  id: SkillCapability;
  label: string;
  description: string;
}> = [
  { id: 'ship', label: 'Ship', description: 'deployable surfaces and APIs' },
  { id: 'retrieve', label: 'Retrieve', description: 'grounded search and context flow' },
  { id: 'model', label: 'Model', description: 'clustering, embeddings, and signal logic' },
  { id: 'operate', label: 'Operate', description: 'automation, tooling, and runtime control' },
];

const SKILL_EVIDENCE: Record<string, SkillEvidence> = {
  'AWS Bedrock': { capability: 'retrieve', projects: ['AWS Docs RAG'] },
  Lambda: { capability: 'ship', projects: ['AWS Docs RAG'] },
  S3: { capability: 'ship', projects: ['AWS Docs RAG'] },
  CloudFront: { capability: 'ship', projects: ['AWS Docs RAG'] },
  'API Gateway': { capability: 'ship', projects: ['AWS Docs RAG'] },
  IAM: { capability: 'operate', projects: ['AWS Docs RAG'] },
  CloudWatch: { capability: 'operate', projects: ['AWS Docs RAG'] },
  Serverless: { capability: 'ship', projects: ['AWS Docs RAG'] },
  RAG: { capability: 'retrieve', projects: ['AWS Docs RAG'] },
  'Vector DB (Pinecone, FAISS)': { capability: 'retrieve', projects: ['AWS Docs RAG', 'Narrative Intelligence Engine'] },
  'HDBSCAN Clustering': { capability: 'model', projects: ['Narrative Intelligence Engine'] },
  'LSH MinHash': { capability: 'model', projects: ['Narrative Intelligence Engine'] },
  Embeddings: { capability: 'model', projects: ['AWS Docs RAG', 'Narrative Intelligence Engine'] },
  'Semantic Search': { capability: 'retrieve', projects: ['AWS Docs RAG'] },
  Python: { capability: 'operate', projects: ['Claude Chaperone', 'AWS Docs RAG', 'Narrative Intelligence Engine'] },
  FastAPI: { capability: 'ship', projects: ['Narrative Intelligence Engine'] },
  'REST APIs': { capability: 'ship', projects: ['Narrative Intelligence Engine'] },
  SQLite: { capability: 'operate', projects: ['Narrative Intelligence Engine'] },
  'Claude Code': { capability: 'operate', projects: ['Claude Chaperone'] },
  GitHub: { capability: 'operate', projects: ['Claude Chaperone'] },
  PowerShell: { capability: 'operate', projects: ['Claude Chaperone'] },
};

export function buildSkillAtlas(skills: SkillGroup[], projects: Project[]): SkillAtlasData {
  const projectNames = new Set(projects.map((project) => project.name));
  const skillRows = skills.flatMap((group) =>
    group.items.map((item) => {
      const evidence = SKILL_EVIDENCE[item];
      const evidenceProjects = evidence?.projects.filter((name) => projectNames.has(name)) ?? [];

      return {
        item,
        group: group.label,
        evidence,
        projects: evidenceProjects,
        proofCount: evidenceProjects.length,
      };
    })
  );

  return {
    provenSkillCount: skillRows.filter((row) => row.proofCount > 0).length,
    totalSkillCount: skillRows.length,
    rows: CAPABILITY_ROWS.map((capability) => ({
      ...capability,
      skills: skillRows
        .filter((row) => row.evidence?.capability === capability.id)
        .map(({ item, group, proofCount, projects }) => ({ item, group, proofCount, projects })),
    })),
    unmappedSkills: skillRows
      .filter((row) => !row.evidence)
      .map(({ item, group, proofCount, projects }) => ({ item, group, proofCount, projects })),
    projects: projects
      .map((project) => ({
        name: project.name,
        tagline: project.tagline,
        skills: skillRows
          .filter((row) => row.evidence?.projects.includes(project.name))
          .map((row) => row.item),
      }))
      .filter(({ skills: projectSkills }) => projectSkills.length > 0),
  };
}

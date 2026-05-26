// ─── Types ──────────────────────────────────────────────────────────────────

export interface Person {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  portfolio: string;
  linkedin: string;
  github: string;
  resumeUrl: string;
}

export interface About {
  summary: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets: string[];
  tags: string[];
}

export interface Project {
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  stack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'active' | 'complete' | 'prototype' | 'archived';
}

export interface EducationEntry {
  institution: string;
  degree: string;
  dates: string;
  notes?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  verifyUrl?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

// ─── Data ───────────────────────────────────────────────────────────────────

export const person: Person = {
  name: 'Aaron Altergott',
  tagline: 'Operations Engineer',
  email: 'adaltergott@gmail.com',
  phone: '(909) 280-1882',
  location: 'Redlands, CA',
  portfolio: 'https://aaronaltergott.cv',
  linkedin: 'https://www.linkedin.com/in/aaronaltergott/',
  github: 'https://github.com/micronwave',
  resumeUrl: '/Aaron_Altergott_Resume.pdf',
};

export const about: About = {
  summary: [
    "I've worked across customer ops, marketing, finance, and engineering. It's not the typical path, but that mix means I tend to see problems differently than someone who came up through one track.",
    
    "Currently, I'm an Operations Specialist at Southwest Self Storage where I automated our auction mailing certification workflow, fixed a recurring autopay failure that was costing us time and money every month, and set up automatic notifications for overdue accounts.",
    
    "That's also why I'm moving into tech. The part of the job I like most is figuring out why something isn't working and then making it work — or making something that kind of works, work more efficiently. Cloud, security, and AI are where I want to do that. They're not really separate fields; they're three layers that depend on each other, and I think you need to understand all three to build anything solid.",
  ],
};

export const experience: ExperienceEntry[] = [
  {
    company: 'Southwest Self Storage',
    role: 'Operations Specialist (CSR)',
    location: 'Redlands, CA',
    dates: 'Nov 2024 – Present',
    bullets: [
      'Eliminated 60+ monthly AMEX and Discover autopay failures by tracing them to an AVS misconfiguration in billing.',
      'Cut auction mail certification processing time by 90% with an automated workflow using file conversion and AI-assisted parsing; authored the companywide process document.',
      'Reduced average monthly past-due balances by 13% after configuring automatic Sitelink SMS to overdue accounts.',
      'Reconcile daily financial reports in Sitelink ERP; monitor AP for duplicates, fraud, and errors before payment.',
      'Run customer support for 500 tenants, handling inquiries and account issues through to resolution.',
      'Analyze competitors and adjust weekly pricing and promotions to stay competitive while maintaining monthly KPIs.',
    ],
    tags: ['Operations', 'ERP', 'Process Automation'],
  },
  {
    company: 'Null404',
    role: 'Operations Volunteer',
    location: 'Remote',
    dates: 'May 2026 – Present',
    bullets: [
      'Run sponsor outreach for a cybersecurity research group, targeting hardware, crypto, cyber, and consulting firms.',
      'Designed the Null404 sponsorship package PDF; assist in development of CTF challenges and game structure.',
    ],
    tags: ['Cybersecurity', 'CTF', 'Outreach'],
  },
  {
    company: 'The Advance Group',
    role: 'Intern',
    location: 'Remote',
    dates: 'May 2023 – Aug 2023',
    bullets: [
      'Analyzed voter records across NYC districts to identify demographic patterns and developed targeted policy recommendations for a councilmember.',
      'Vetted ~100 NYC organizations across industries and wrote partnership proposals that shaped client outreach decisions.',
    ],
    tags: ['Research', 'Policy', 'Data Analysis'],
  },
];

export const projects: Project[] = [
  {
    name: 'Claude Chaperone',
    tagline:
      'Installs a plan-build-audit-commit workflow into any Claude Code project with a single command.',
    description:
      'A collection of slash commands, Python hooks, and a routing skill that enforce a structured development loop inside Claude Code. The key mechanic is mandatory /clear calls between stages, which wipes session context so each phase runs in a fresh context without accumulated drift.',
    bullets: [
      'Twelve slash commands step through planning, phase splitting, test-first building, diff auditing, and commit — each stage runs in its own cleared context so Claude does not carry assumptions from prior work.',
      'Four stdlib Python hooks handle scope drift warnings at end-of-turn, git push confirmation prompts, build log sync reminders, and session state injection after /clear so Claude picks up where it left off.',
      'The installer merges settings.json without clobbering existing hooks and runs a 58-test suite to confirm the install is clean; idempotent and safe to re-run on existing projects.',
      'A routing skill auto-triggers on phrases like "build phase" or "audit"; running /chaperone with no arguments reads current workflow state and tells you the exact next command to run.',
    ],
    stack: ['Python', 'Claude Code', 'Slash Commands', 'Python Hooks'],
    githubUrl: 'https://github.com/micronwave/claude-chaperone',
    status: 'active',
  },
  {
    name: 'Narrative Intelligence Engine',
    tagline:
      'Tracks financial narratives across news, SEC filings, and Reddit, scores their momentum, and maps them to S&P 500 tickers.',
    description:
      'An 11-stage pipeline running on a 4-hour schedule that clusters documents into narratives and tracks how those narratives grow, shift, and decay. Not a trading system. It watches the stories that move markets, not the markets themselves.',
    bullets: [
      'Deduplicates incoming documents with LSH MinHash (0.85 Jaccard threshold), clusters survivors into narratives using HDBSCAN, and tracks centroid drift over time as a signal of narrative mutation.',
      'Maps narratives to S&P 500 tickers by computing cosine similarity between narrative embeddings and a pre-built library of ticker embeddings generated from SEC 10-K summaries.',
      'Flags coordinated campaigns: five or more sources posting about the same narrative within 300 seconds triggers the adversarial burst detector.',
      'Uses Claude Haiku for routine topic labeling and Claude Sonnet only for mutation analysis, with a configurable daily token budget cap to keep LLM costs predictable.',
      'FastAPI backend with 66 routes; Next.js frontend with views for signal radar, constellation graph, coordination detection, and velocity-price correlation explorer.',
    ],
    stack: [
      'Python',
      'FastAPI',
      'Claude API',
      'HDBSCAN',
      'FAISS',
      'Sentence Transformers',
      'SQLite',
      'Next.js',
      'TypeScript',
    ],
    githubUrl: 'https://github.com/micronwave/market-narrative-engine',
    status: 'active',
  },
  {
    name: 'AWS Docs RAG',
    tagline:
      'Answers questions about AWS services by retrieving relevant documentation and generating grounded responses with Claude.',
    description:
      'A full serverless RAG pipeline deployed on AWS. The ingestion side runs once to scrape, chunk, embed, and index AWS documentation. The query side runs per-request inside Lambda, retrieving the closest document chunks and passing them to Claude via Bedrock.',
    bullets: [
      'Scraped about 120 pages across five AWS services, split into 1000-character chunks with 200-character overlap, embedded with Amazon Titan v2 (1024 dimensions), and indexed in Pinecone with cosine similarity.',
      'At query time: embeds the question with the same Titan model, retrieves the top 5 chunks from Pinecone, assembles a grounded prompt with anti-hallucination instructions, calls Claude via Bedrock, and returns the answer with source URLs.',
      'Each ingestion script writes a manifest and checks that the previous stage completed before running, so partial failures do not corrupt the index.',
      'Lambda runs with a scoped IAM policy (Bedrock invoke and CloudWatch only); quota enforcement via API Gateway; the frontend is a single static HTML file on CloudFront.',
    ],
    stack: [
      'Python',
      'Claude (Bedrock)',
      'Amazon Titan Embeddings',
      'Pinecone',
      'AWS Lambda',
      'API Gateway',
      'S3',
      'CloudFront',
    ],
    githubUrl: 'https://github.com/micronwave/aws-docs-rag',
    liveUrl: 'https://d3d0zch3u8ca61.cloudfront.net',
    status: 'complete',
  },
];

export const education: EducationEntry[] = [
  {
    institution: 'California State University, Long Beach',
    degree: 'BA in International Studies',
    dates: 'Aug 2019 – Dec 2023',
  },
];

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Cloud Practitioner (CLF-C02)',
    issuer: 'Amazon Web Services',
    issued: 'Apr 2026',
    verifyUrl:
      'https://www.credly.com/badges/eac4215c-2810-4a58-a293-7c4cfe690d7d/public_url',
  },
];

export const skills: SkillGroup[] = [
  {
    label: 'Cloud',
    items: [
      'AWS Bedrock',
      'Lambda',
      'S3',
      'CloudFront',
      'API Gateway',
      'IAM',
      'CloudWatch',
      'Serverless',
    ],
  },
  {
    label: 'AI / ML',
    items: ['RAG', 'Vector DB (Pinecone, FAISS)', 'HDBSCAN Clustering', 'LSH MinHash', 'Embeddings', 'Semantic Search'],
  },
  {
    label: 'Languages & Frameworks',
    items: ['Python', 'FastAPI', 'REST APIs', 'SQLite', 'CI/CD'],
  },
  {
    label: 'Tools',
    items: ['Claude Code', 'GitHub', 'Linux', 'Docker', 'PowerShell'],
  },
];

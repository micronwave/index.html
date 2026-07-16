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
  startHour?: number;
  startMinute?: number;
  startSecond?: number;
}

export interface ProjectDetail {
  problem: string;
  decisions: string[];
}

export interface Project {
  name: string;
  tagline: string;
  bullets: string[];
  stack: string[];
  flow?: string[];
  githubUrl?: string;
  liveUrl?: string;
  screenshotUrl?: string;
  status: 'active' | 'complete' | 'prototype' | 'archived';
  detail?: ProjectDetail;
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
    "I sit between business operations and the tools that run them. I'm close enough to the process to see what's breaking, and technical enough to build the fix. My background runs through customer ops, marketing, sales, and finance, with a layer of backend configuration and API integration underneath.",

    "I've automated workflows, fixed recurring failures, and cleaned up processes that were costing time and money. I like working the whole arc of a problem, from figuring out why something's broken to fixing it.",

    "I'm AWS certified and working toward Solutions Architect to have a real technical footing on the infrastructure side of the business. It's also why the projects below skew toward cloud infra, data pipelines, and agent orchestration.",
  ],
};

export const experience: ExperienceEntry[] = [
  {
    company: 'Southwest Self Storage',
    role: 'Operations Specialist',
    location: 'Redlands, CA',
    dates: 'Nov 2024 – Present',
    startHour: 8,
    startMinute: 17,
    startSecond: 43,
    bullets: [
      'Reduced past-due balances by 13% by implementing SMS automation in CallPotential, integrating customer data via the SiteLink API to trigger payment reminders',
      'Constructed an automated competitor pricing dashboard for the COO using Python, Playwright, and the Google Sheets API, replacing manual spreadsheets with real-time data insights',
      'Discovered and responsibly disclosed a security vulnerability in our third-party AI vendor\'s infrastructure that publicly exposed customer data and production backups; coordinated with vendor to validate and patch',
      'Designed an AI pipeline that automates the review of TIF image scans to verify customer lien compliance',
      'Recovered $85K in on-time monthly revenue by fixing an ERP billing config error causing AMEX/Discover autopay declines. Verified issue by auditing payment logs and billing rules',
      'Run the full customer lifecycle for 500 tenants, from lead follow-up and account setup to accounts receivable',
    ],
    tags: ['Operations', 'ERP', 'Process Automation'],
  },
  {
    company: 'Null404',
    role: 'Partnerships Lead (Volunteer)',
    location: 'Remote',
    dates: 'Apr 2026 – Present',
    startHour: 402,
    startMinute: 42,
    startSecond: 11,
    bullets: [
      'Built an n8n pipeline on Oracle Cloud\'s free tier that syncs sponsor deal stages between Notion and HubSpot daily so Null leadership can track progress',
      'Lead sponsor outreach for a cybersecurity research group, coordinated with leadership to secure 2 gear sponsorships',
      'Designed the sponsorship package; help design CTF challenges',
    ],
    tags: ['Cybersecurity', 'CTF', 'Outreach'],
  },
  {
    company: 'The Advance Group',
    role: 'Intern',
    location: 'Remote',
    dates: 'May 2023 – Aug 2023',
    bullets: [
      'Vetted ~100 NYC organizations across industries and wrote partnership proposals with fellow interns to shape outreach decisions',
      'Analyzed voter data and patterns to develop targeted policy recommendations for NYC councilmember client',
    ],
    tags: ['Research', 'Policy', 'Data Analysis'],
  },
];

export const projects: Project[] = [
  {
    name: 'Orca',
    tagline:
      "Splits a goal across Claude, Codex, and CI, and won't call it done until every gate passes and the logs prove it.",
    bullets: [
      'Routes work to the right agent: Claude implements, Codex reviews, CI gates verify',
      'Breaks each goal into checkable exit conditions, like "tests in internal/store must pass", before any agent runs',
      'Runs each agent in a sandboxed capsule with only the files it needs, a token budget, and gates to clear',
    ],
    stack: ['Go', 'TypeScript', 'Claude API', 'Codex', 'GitHub API'],
    flow: ['goal', 'plan', 'capsule', 'verify', 'merge'],
    githubUrl: 'https://github.com/micronwave/orca',
    screenshotUrl: '/screenshot-orca.png',
    status: 'active',
    detail: {
      problem:
        'Agents report success whether or not they earned it. When Claude says the tests pass, you can\'t tell if it ran them or just said so. Orca defines what "done" means before anything runs, checks it mechanically, and keeps the logs as proof.',
      decisions: [
        "Exit conditions are locked in before any agent runs, so an agent can't quietly decide it's done when it isn't.",
        "Each agent gets a briefing built from the current goal state, not the full conversation. Claude never sees Codex's review notes, and vice versa, which keeps both focused.",
        'Every step is written to the event log before it executes, so a killed process always has a checkpoint to resume from.',
      ],
    },
  },
  {
    name: 'AWS Docs RAG',
    tagline:
      'Answers AWS questions from the current documentation, with source URLs attached, for about $3 a month.',
    bullets: [
      'Ingestion: scrapes ~120 doc pages across five AWS services, embeds them with Amazon Titan v2, and indexes them in Pinecone',
      'Query: embeds the question, pulls the top 5 matching chunks, and hands them to Claude with instructions not to answer beyond what was retrieved',
      "Each ingestion script writes a manifest and checks the previous stage finished before it runs, so a partial failure can't silently corrupt the index",
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
    flow: ['docs', 'chunks', 'embed', 'retrieve', 'answer'],
    githubUrl: 'https://github.com/micronwave/aws-docs-rag',
    liveUrl: 'https://d3d0zch3u8ca61.cloudfront.net',
    screenshotUrl: '/screenshot-rag.png',
    status: 'complete',
    detail: {
      problem:
        "I built this to study for my AWS Cloud Practitioner exam. Claude describes AWS services confidently from training data, but training data isn't the current docs. This retrieves the relevant doc chunks at query time and builds the prompt around them, so answers come back grounded, with sources.",
      decisions: [
        'S3, EC2, Lambda, DynamoDB, and VPC cover most AWS architecture questions, and a question about one usually involves another.',
        'Chunks are 1000 characters with a 200-character overlap, so a concept that spans a split boundary still surfaces in retrieval.',
        "Pinecone's free tier runs about $3 a month where OpenSearch Serverless would run $700, for the same architecture.",
      ],
    },
  },
  {
    name: 'Narrative Intelligence Engine',
    tagline:
      'Tracks financial narratives across news, SEC filings, and Reddit, scores their momentum, and maps them to S&P 500 tickers.',
    bullets: [
      "Deduplicates incoming documents with LSH MinHash, then clusters what's left into narratives with HDBSCAN",
      'Maps each narrative to S&P 500 tickers by comparing embeddings against a library built from SEC 10-K summaries',
      'Flags coordinated campaigns: five or more sources posting the same narrative within 300 seconds trips the burst detector',
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
    flow: ['sources', 'cluster', 'score', 'map'],
    githubUrl: 'https://github.com/micronwave/market-narrative-engine',
    screenshotUrl: '/screenshot-nie.png',
    status: 'complete',
    detail: {
      problem:
        'The same financial story surfaces as an RSS headline, a Reddit thread, and an SEC filing. NIE pulls those fragments together every four hours, clusters them into tracked narratives, and watches how they evolve.',
      decisions: [
        "The number of active narratives isn't knowable in advance, so HDBSCAN discovers it from the data rather than using a fixed cluster count.",
        "A narrative counts as mutating when its cluster center shifts semantically, not when a keyword or title changes.",
        'Narratives move through five lifecycle stages, Emerging through Dormant. A dormant one that spikes past 0.10 velocity reverts straight to Growing, since going quiet and spiking back is itself a signal.',
        'The coordination window is tuned to catch real bursts while ignoring organic spread across sources; Sonnet filters the false positives from there.',
      ],
    },
  },
  {
    name: 'Propagandle',
    tagline:
      'A daily five-round trivia game about real historical events, declassified programs, and the myths that get mistaken for them.',
    bullets: [
      'Four round types pull from a pool of real, sourced historical events and programs, mixed with fabricated ones written to sound just as plausible',
      'One puzzle a day, done in a few minutes: guess, reveal, keep the streak going',
      'No account needed — streaks and scores start tracking from the first round',
    ],
    stack: ['React', 'Vite', 'TypeScript', 'Supabase', 'Vercel', 'Vercel OG'],
    flow: ['issue', 'play', 'reveal', 'share'],
    liveUrl: 'https://propagandle.com',
    screenshotUrl: '/screenshot-propagandle.png',
    status: 'active',
    detail: {
      problem:
        "Daily browser games tend to demand an account or sprawl into an endless quiz. Propagandle borrows Wordle's shape: five rounds, a few minutes, nothing to sign up for.",
      decisions: [
        'An anonymous UUID cookie tracks streaks instead of an account. Zero friction on day one, with a clean migration path to real accounts later.',
        "The daily puzzle comes from a Supabase edge function at request time, so the answers never ship in the page source.",
        'Fabricated entries are written to match the tone and specificity of the real ones. The game only works if the fakes are as believable as the truth.',
      ],
    },
  },
  {
    name: 'Claude Chaperone',
    tagline:
      'Installs a plan-build-audit-commit workflow into any Claude Code project with a single command.',
    bullets: [
      'Twelve slash commands step through planning, test-first building, diff auditing, and commit, each stage in its own cleared context',
      'Dependency-free Python hooks handle scope-drift warnings, a confirmation prompt before git push, and state injection right after /clear',
      'The installer merges into settings.json without clobbering existing hooks, runs its test suite to verify, and is safe to re-run',
    ],
    stack: ['Python', 'Claude Code', 'Slash Commands', 'Python Hooks'],
    flow: ['plan', 'build', 'audit', 'commit'],
    githubUrl: 'https://github.com/micronwave/claude-chaperone',
    status: 'complete',
    detail: {
      problem:
        "In long sessions, Claude accumulates problems: carried-over assumptions, gaps it guessed at, scope drift. A mandatory /clear between stages fixes that, and a hook injects the previous state right after, so the thread doesn't actually break.",
      decisions: [
        "It's scoped for multi-phase work, where the overhead pays for itself. A one-file fix doesn't need a workflow.",
        'If codex, gemini, or aider are on PATH, one of them runs the audit pass. Otherwise a fresh subagent handles it.',
        "/re-audit is capped at three loops, so the workflow can't turn into its own kind of scope drift.",
        '/handoff writes a self-contained state file mid-workflow, and the next session picks it up without re-explaining anything.',
      ],
    },
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
      'AWS (Bedrock, Lambda, S3, CloudFront, API Gateway, IAM, CloudWatch, CLI)',
      'Oracle Cloud (OCI)',
    ],
  },
  {
    label: 'AI / ML',
    items: ['RAG', 'Semantic Search', 'Embeddings', 'Vector DB (Pinecone, FAISS)', 'HDBSCAN Clustering', 'LSH MinHash'],
  },
  {
    label: 'Backend',
    items: ['Python', 'SQL', 'REST APIs', 'Webhooks', 'FastAPI', 'CI/CD', 'Supabase', 'Web scraping', 'SQLite'],
  },
  {
    label: 'Tools',
    items: ['HubSpot', 'n8n', 'Retool', 'Notion', 'Playwright', 'Claude Code', 'GitHub', 'Docker', 'Sitelink ERP', 'Codex'],
  },
  {
    label: 'Ops',
    items: ['LLM ops', 'Financial ops', 'Competitive analysis', 'Customer & tech support', 'AP/AR', 'Client outreach'],
  },
];

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
    "I build and automate the internal systems that cut busy work and protect revenue. My background runs through customer ops, marketing, sales, and finance, and underneath that is a technical layer of backend configuration and API integration.",

    "I've automated workflows, fixed recurring failures, and cleaned up processes that were costing time and money. I like working the whole arc of a problem, from figuring out why something's broken to building the fix that makes it better.",

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
      "Splits a goal across multiple AI agents — Claude, Codex, your CI — and won't call it done until every gate passes and the logs prove it.",
    bullets: [
      'Routes each part of a goal to the right agent automatically: Claude implements, Codex reviews, CI gates verify. No copy-pasting context between windows or re-explaining what you\'re doing',
      'Before any agent starts, the goal gets broken into specific, checkable conditions, like "tests in internal/store must pass", so every agent works against a contract instead of a vague instruction',
      'Each run gets its own sandboxed capsule: only the files it needs, a token budget, and a set of gates it has to clear before a patch moves forward',
    ],
    stack: ['Go', 'TypeScript', 'Claude API', 'Codex', 'GitHub API'],
    flow: ['goal', 'plan', 'capsule', 'verify', 'merge'],
    githubUrl: 'https://github.com/micronwave/orca',
    screenshotUrl: '/screenshot-orca.png',
    status: 'active',
    detail: {
      problem:
        'An agent telling you the tests pass isn\'t the same as an agent showing you the logs. Most agent workflows fall apart right there, you can\'t tell if it actually ran the tests or just said so. Orca decides what "done" means before anything runs, then keeps the proof.',
      decisions: [
        "Exit conditions get defined before any agent runs, not negotiated after the fact, so an agent can't quietly decide it's done when it isn't.",
        "Each agent gets a briefing built from the current goal state, not a replay of the whole conversation. Claude doesn't need Codex's review notes, and Codex doesn't need Claude's implementation history. Keeping them apart is what keeps each one focused.",
        'Every step gets written to the event log before it runs, so a killed process always has a checkpoint to resume from. Reconstructing state from memory after a crash was never reliable enough to trust.',
      ],
    },
  },
  {
    name: 'AWS Docs RAG',
    tagline:
      'Answers questions about AWS services by retrieving relevant documentation and generating grounded responses with Claude.',
    bullets: [
      'Ingestion side: scraped about 120 pages across five AWS services, chunked them (1000 characters, 200-character overlap), embedded with Amazon Titan v2, and indexed in Pinecone',
      "Query side: embeds your question with the same Titan model, pulls the top 5 matching chunks from Pinecone, and hands them to Claude via Bedrock along with instructions not to answer beyond what's retrieved",
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
        "Claude can describe AWS services confidently from training data — which is exactly the problem, since training data isn't the current docs. This pulls the relevant chunks from the actual documentation at query time and builds the prompt around them, so answers come back grounded with source URLs attached. I built it to study for my AWS Cloud Practitioner exam.",
      decisions: [
        'S3, EC2, Lambda, DynamoDB, and VPC cover what shows up in almost every AWS architecture question, since a question about one usually involves another.',
        "A concept that starts near the end of one chunk still shows up at the start of the next, thanks to the 200-character overlap. Retrieval doesn't miss it just because of an arbitrary split boundary.",
        "Pinecone's free tier over OpenSearch Serverless keeps this around $3 a month instead of $700, for the same architecture. That price difference is what makes it worth running long-term.",
        'Adding a new AWS service is just adding its URLs to the first ingestion script and re-running it.',
      ],
    },
  },
  {
    name: 'Narrative Intelligence Engine',
    tagline:
      'Tracks financial narratives across news, SEC filings, and Reddit, scores their momentum, and maps them to S&P 500 tickers.',
    bullets: [
      "Deduplicates incoming documents with LSH MinHash, then clusters what's left into narratives with HDBSCAN. When a cluster's center drifts over time, that's the signal the narrative is mutating",
      'Maps each narrative to S&P 500 tickers by comparing its embedding against a library of ticker embeddings built from SEC 10-K summaries',
      'Flags coordinated campaigns automatically: five or more sources posting the same narrative within 300 seconds trips the adversarial burst detector',
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
        'Financial narratives are scattered, so the same story surfaces as an RSS headline, a Reddit thread, and an SEC filing. NIE aggregates those fragments across sources every four hours, clusters them into tracked narratives, and watches how they evolve.',
      decisions: [
        "The number of active narratives at any moment isn't knowable in advance, so HDBSCAN discovers it in the data instead of using a fixed cluster count.",
        "When a narrative cluster's center shifts semantically, that's what gets flagged, not a keyword change or title match.",
        'Narratives move through five lifecycle stages: Emerging, Growing, Mature, Declining, Dormant. A dormant one that spikes past 0.10 velocity reverts straight to Growing, since going quiet and then spiking back up is itself a signal.',
        'The 300-second coordination window is short enough to catch a real burst but long enough to ignore organic spread across sources. Sonnet handles the false-positive filtering from there.',
      ],
    },
  },
  {
    name: 'Propagandle',
    tagline:
      'A daily five-round trivia game about real historical events, declassified programs, and the myths that get mistaken for them.',
    bullets: [
      'Four round types pull from a pool of real, sourced historical events and programs, mixed in with fabricated ones written to sound just as plausible',
      "The daily puzzle is served from a Supabase edge function instead of being baked into the client bundle, so opening dev tools doesn't spoil the day's answers",
      "Streaks and scores track through an anonymous UUID cookie, so there's no signup wall before your first round",
    ],
    stack: ['React', 'Vite', 'TypeScript', 'Supabase', 'Vercel', 'Vercel OG'],
    flow: ['issue', 'play', 'reveal', 'share'],
    liveUrl: 'https://propagandle.com',
    screenshotUrl: '/screenshot-propagandle.png',
    status: 'active',
    detail: {
      problem:
        "Most daily browser games either lock everything behind an account or turn into an endless quiz. Propagandle borrows Wordle's shape instead: one short session a day, five rounds, done in a few minutes, nothing to sign up for.",
      decisions: [
        'An anonymous UUID cookie handles streaks instead of an account, so there is zero friction on day one. It is a clean migration path to real accounts later if that is ever worth building.',
        'The daily puzzle is fetched from a Supabase edge function at request time instead of shipping with the client bundle, so the day\'s answers are not just sitting in the page source.',
        'Hosted on Vercel instead of a dedicated server, since a five-round daily quiz does not need infrastructure to provision, patch, or scale. Deploys are free and there is nothing running that I have to keep alive myself.',
      ],
    },
  },
  {
    name: 'Claude Chaperone',
    tagline:
      'Installs a plan-build-audit-commit workflow into any Claude Code project with a single command.',
    bullets: [
      'Twelve slash commands step through planning, phase splitting, test-first building, diff auditing, and commit. Each stage runs in its own cleared context, so Claude never carries assumptions in from a prior step',
      "Four Python hooks (no extra dependencies) handle the rest: scope-drift warnings at the end of a turn, a confirmation prompt before git push, build-log sync reminders, and state injection right after /clear so Claude picks up where it left off",
      "The installer merges into your settings.json without clobbering existing hooks, then runs a 58-test suite to confirm the install is clean. It's idempotent, so it's safe to re-run on a project you've already set up",
    ],
    stack: ['Python', 'Claude Code', 'Slash Commands', 'Python Hooks'],
    flow: ['plan', 'build', 'audit', 'commit'],
    githubUrl: 'https://github.com/micronwave/claude-chaperone',
    status: 'complete',
    detail: {
      problem:
        "In long sessions, Claude accumulates problems: carried-over assumptions, gaps it filled in when it shouldn't have guessed, scope drift. A mandatory /clear between every stage fixes that, since each phase then runs in a fresh context. A hook injects the previous state right after /clear, so the thread doesn't actually break.",
      decisions: [
        "A one-file fix or a typo doesn't need this workflow, it's scoped for multi-phase work, where the overhead actually pays for itself.",
        'If codex, gemini, or aider are on PATH, one of them runs the audit pass. If none are, an isolated fresh subagent handles it instead.',
        "/re-audit is capped at three loops, so the workflow doesn't turn into its own kind of scope drift. /handoff writes a self-contained state file mid-workflow, and the next session picks it up without you re-explaining what happened.",
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

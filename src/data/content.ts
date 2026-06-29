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
  description: string;
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
    "AWS Certified operations specialist who builds tools to make life easier. Working across customer ops, marketing, finance, sales, and engineering gives me a different perspective than someone who came up through one track.",

    "I've automated workflows, fixed recurring failures, and tightened up processes that were wasting my company time and money. I enjoy figuring out why something isn't working and making it work, or taking something that kind of works and making it more efficient.",
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
      'Cut past-due balances by 13% after configuring SMS automation in CallPotential via Sitelink ERP API',
      'Built the COO a competitor pricing dashboard in Python and Playwright that auto updates in Google Sheets, replacing the weekly manual spreadsheet',
      'Identified and escalated a security vulnerability in our third-party AI vendor\'s S3 infrastructure that publicly exposed customer data and backups',
      'Built an AI pipeline that pulls tenant names from hundreds of unsearchable TIF scans and verifies lien letter compliance, replacing the manual process. Wrote the procedure doc',
      'Fixed long standing AMEX and Discover autopay failures that the team had been working around manually, traced it to the ERP billing config',
      'Run the full customer lifecycle for 500 tenants, from closing rentals to collections and billing/account issues',
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
      'Orchestration runtime that routes each part of a goal to the right agent, holds each to a contract, and returns a merge recommendation with the evidence attached.',
    description:
      'Give Orca a goal and it decides which agents handle which parts: Claude implements, Codex reviews, your CI gates verify. Each gets a briefing scoped to its role and works against a checkable contract. You get a merge recommendation with the test logs attached, not just an agent\'s word for it.',
    bullets: [
      'Delegates each task to the right agent automatically: Claude handles implementation, Codex handles review, and your CI gates run verification. No copy-pasting between windows, no re-explaining context',
      'Before any agent runs, Orca translates the goal into specific, checkable obligations. Conditions like "tests in internal/store must pass" are defined upfront so every agent works against a contract, not an open-ended instruction',
      'Each agent run is isolated in an Execution Capsule with exactly the files it needs, a token budget, and verification gates; a patch only advances when the gates clear and evidence is attached',
      'Writes every step to an event log before execution; if the process dies, `orca resume` picks up from the last checkpoint with no work lost',
    ],
    stack: ['Go', 'TypeScript', 'Claude API', 'Codex', 'GitHub API'],
    flow: ['goal', 'plan', 'capsule', 'verify', 'merge'],
    githubUrl: 'https://github.com/micronwave/orca',
    screenshotUrl: '/screenshot-orca.png',
    status: 'active',
    detail: {
      problem:
        "An agent that says tests pass is not the same as one that shows you the logs. Most agent-assisted workflows collapse at that gap; there is no way to know if the agent actually ran the tests or just said it did. Orca defines what done means upfront, runs the gates, and stores the artifacts that prove it.",
      decisions: [
        'Exit conditions are defined before any agent runs, not negotiated after. An agent working against a contract cannot quietly decide it is done when it is not.',
        'Each agent gets a briefing compiled from current goal state, not a replay of the full conversation. Claude does not need Codex\'s review notes, and Codex does not need Claude\'s implementation history; keeping them separate is what keeps each agent on task.',
        'Every step is written to the event log before it runs, so a killed process always has a checkpoint. Reconstructing state from memory after a crash was too unreliable to trust.',
      ],
    },
  },
  {
    name: 'Claude Chaperone',
    tagline:
      'Installs a plan-build-audit-commit workflow into any Claude Code project with a single command.',
    description:
      'A collection of slash commands, Python hooks, and a routing skill that enforce a structured development loop inside Claude Code. The key mechanic is mandatory /clear calls between stages, which wipes session context so each phase runs in a fresh context without accumulated drift.',
    bullets: [
      'Twelve slash commands step through planning, phase splitting, test-first building, diff auditing, and commit — each stage runs in its own cleared context so Claude does not carry assumptions from prior work',
      'Four stdlib Python hooks handle scope drift warnings at end-of-turn, git push confirmation prompts, build log sync reminders, and session state injection after /clear so Claude picks up where it left off',
      'The installer merges settings.json without clobbering existing hooks and runs a 58-test suite to confirm the install is clean; idempotent and safe to re-run on existing projects',
      'A routing skill auto-triggers on phrases like "build phase" or "audit"; running /chaperone with no arguments reads current workflow state and tells you the exact next command to run',
    ],
    stack: ['Python', 'Claude Code', 'Slash Commands', 'Python Hooks'],
    flow: ['plan', 'build', 'audit', 'commit'],
    githubUrl: 'https://github.com/micronwave/claude-chaperone',
    status: 'complete',
    detail: {
      problem:
        "Claude accumulates issues in long sessions by carrying assumptions, filling in gaps it shouldn't, and drifting from scope. Mandatory /clear between every stage fixes this as each phase runs in a fresh context. session_start.py injects previous state after /clear so the thread doesn't break.",
      decisions: [
        "A one-file fix or a typo doesn't need this workflow, only scoped for multi-phase work. The overhead only pays off when the task spans multiple sessions.",
        'If codex, gemini, or aider are on PATH, they run the audit pass. If none are present, an isolated fresh subagent handles it.',
        'Three loop cap on /re-audit keeps the workflow from turning into its own kind of scope drift. /handoff writes a self-contained state file mid workflow and the next session reads it and picks up without you re-explaining what happened.',
      ],
    },
  },
  {
    name: 'Narrative Intelligence Engine',
    tagline:
      'Tracks financial narratives across news, SEC filings, and Reddit, scores their momentum, and maps them to S&P 500 tickers.',
    description:
      'An 11-stage pipeline running on a 4-hour schedule that clusters documents into narratives and tracks how those narratives grow, shift, and decay. Not a trading system. It watches the stories that move markets, not the markets themselves.',
    bullets: [
      'Deduplicates incoming documents with LSH MinHash (0.85 Jaccard threshold), clusters survivors into narratives using HDBSCAN, and tracks centroid drift over time as a signal of narrative mutation',
      'Maps narratives to S&P 500 tickers by computing cosine similarity between narrative embeddings and a pre-built library of ticker embeddings generated from SEC 10-K summaries',
      'Flags coordinated campaigns: five or more sources posting about the same narrative within 300 seconds triggers the adversarial burst detector',
      'Uses Claude Haiku for routine topic labeling and Claude Sonnet only for mutation analysis, with a configurable daily token budget cap to keep LLM costs predictable',
      'FastAPI backend with 66 routes; Next.js frontend with views for signal radar, constellation graph, coordination detection, and velocity-price correlation explorer',
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
        "The number of active narratives at any moment isn't knowable in advance, HDBSCAN discovers it in the data.",
        "When a narrative cluster's center shifts semantically, that movement is what gets flagged, not a keyword change or title match.",
        'Emerging, Growing, Mature, Declining, Dormant lifecycle stages. A dormant narrative that spikes past 0.10 velocity reverts to Growing automatically because going quiet and then spiking is itself a signal.',
        'The 300-second window in the coordination detector is short enough to catch a coordinated burst, long enough to filter organic spread across sources. False positive filtering is straight forward when sent to Sonnet for analysis.',
      ],
    },
  },
  {
    name: 'AWS Docs RAG',
    tagline:
      'Answers questions about AWS services by retrieving relevant documentation and generating grounded responses with Claude.',
    description:
      'A full serverless RAG pipeline deployed on AWS. The ingestion side runs once to scrape, chunk, embed, and index AWS documentation. The query side runs per-request inside Lambda, retrieving the closest document chunks and passing them to Claude via Bedrock.',
    bullets: [
      'Scraped about 120 pages across five AWS services, split into 1000-character chunks with 200-character overlap, embedded with Amazon Titan v2 (1024 dimensions), and indexed in Pinecone with cosine similarity',
      'At query time: embeds the question with the same Titan model, retrieves the top 5 chunks from Pinecone, assembles a grounded prompt with anti-hallucination instructions, calls Claude via Bedrock, and returns the answer with source URLs',
      'Each ingestion script writes a manifest and checks that the previous stage completed before running, so partial failures do not corrupt the index',
      'Lambda runs with a scoped IAM policy (Bedrock invoke and CloudWatch only); quota enforcement via API Gateway; the frontend is a single static HTML file on CloudFront',
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
        "Claude can describe AWS services confidently from training data, which is precisely the issue, training data isn't the current documentation. This RAG retrieves the relevant chunks from the actual docs at query time and builds the prompt around them. Responses come back grounded in reality with source URLs attached. I used this to study for my AWS CP exam.",
      decisions: [
        'S3, EC2, Lambda, DynamoDB, and VPC cover what shows up in almost every AWS architecture question, questions about one usually involve another.',
        'A concept that starts near the end of one chunk appears at the start of the next because of the 200 character chunk overlap. Retrieval does not miss it because of an arbitrary split boundary.',
        'Pinecone free tier over OpenSearch Serverless keeps it at ~$3/month vs ~$700. Same architecture but that price difference is what made this easily deployable.',
        'Adding new AWS services is as easy as putting the URLs in the first ingestion script and triggering a rerun.',
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
      'Oracle Cloud',
      'Vercel',
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

export interface ArticleSection {
  heading: string
  body: string
}

export interface Article {
  slug: string
  title: string
  tag: string
  color: string
  readTime: string
  sections: ArticleSection[]
}

export const articles: Article[] = [
  {
    slug: "how-to-plan-your-learning-journey",
    title: "How to Plan Your Learning Journey",
    tag: "Strategy",
    color: "orange",
    readTime: "6 min read",
    sections: [
      {
        heading: "Start with a clear goal",
        body: "Before writing down a single topic, ask yourself: what do I want to be able to do six months from now? A vague intention like 'learn programming' leads nowhere. A concrete goal — 'build and deploy a full-stack web app' — gives every study session a direction. Write it down. Revisit it weekly.",
      },
      {
        heading: "Audit what you already know",
        body: "Treat your existing knowledge as a map. Draw three columns: things I know well, things I've heard of but can't explain, and things I know nothing about. This stops you wasting weeks re-learning material you already understand, and surfaces the real gaps you need to fill.",
      },
      {
        heading: "Break the journey into milestones",
        body: "A six-month goal feels abstract on day one. Break it into monthly milestones, then weekly targets. Each milestone should be a demonstrable output — a project, a certificate, a problem you can now solve — not just 'finish chapter 5'. Outputs keep you honest about real progress.",
      },
      {
        heading: "Choose depth over breadth",
        body: "The internet will always offer another tutorial. The trap is tutorial hopping — watching hours of content without building anything. Pick one primary resource per topic and follow it to completion. Supplement only when you hit a genuine blocker. Depth compounds; breadth evaporates.",
      },
      {
        heading: "Build accountability into the system",
        body: "Tell someone your goal. Share weekly updates on a Discord server, write a short thread, or find a study partner. External accountability dramatically increases follow-through. The awkwardness of admitting you didn't show up is a surprisingly powerful motivator.",
      },
      {
        heading: "Review and adjust every four weeks",
        body: "Learning plans written in month one rarely survive contact with reality. Schedule a monthly review: what did you finish, what took longer than expected, what should you cut? A roadmap you adapt is more valuable than a perfect plan you abandon.",
      },
    ],
  },
  {
    slug: "top-tools-for-building-roadmaps",
    title: "Top Tools for Building Roadmaps",
    tag: "Tools",
    color: "violet",
    readTime: "5 min read",
    sections: [
      {
        heading: "Why your tool choice matters",
        body: "A roadmap you can't easily update is a roadmap you stop using. The right tool removes friction from the revision process — so when your goals shift (and they will), you edit rather than abandon the plan.",
      },
      {
        heading: "Tutoreez — purpose-built for learning paths",
        body: "Tutoreez lets you create structured, visual roadmaps with nodes, dependencies, and progress tracking. Unlike generic tools, every feature is built around learning workflows: resource linking, milestone tracking, and a tree view that makes your path easy to grasp at a glance.",
      },
      {
        heading: "Notion — flexible knowledge base",
        body: "Notion works well for learners who want prose-heavy roadmaps alongside notes, reading lists, and project logs. Its database feature lets you tag resources by status (not started, in progress, done) and filter your view. The downside: it requires more manual setup than a dedicated roadmap tool.",
      },
      {
        heading: "Obsidian — for deep, connected thinking",
        body: "Obsidian's graph view turns your notes into a visual map of interconnected ideas. Ideal for learners building conceptual knowledge — mathematics, philosophy, research — where understanding relationships between topics matters as much as topic coverage.",
      },
      {
        heading: "Trello and Linear — for project-style execution",
        body: "If your roadmap is tightly tied to deliverables (shipping a product, completing a course syllabus), a Kanban board keeps day-to-day tasks visible. Trello is simple and free; Linear adds priority scoring and cycle planning for more complex workflows.",
      },
      {
        heading: "The tool is not the strategy",
        body: "No tool compensates for a poorly thought-out plan. Spend 80% of your setup time defining your goal, milestones, and review cadence — and 20% on the tool. The best roadmap is the one you actually open every day.",
      },
    ],
  },
  {
    slug: "roadmap-case-studies",
    title: "Roadmap Case Studies",
    tag: "Case Study",
    color: "rose",
    readTime: "7 min read",
    sections: [
      {
        heading: "Case study 1: Career switch into software engineering",
        body: "Aarav was a marketing analyst with no coding background. He set a single goal — land a junior frontend role within 12 months. His roadmap covered HTML/CSS basics (weeks 1–4), JavaScript fundamentals (weeks 5–12), React (weeks 13–20), and portfolio projects (weeks 21–48). The key decision was cutting backend topics entirely until after his first job. Focus on one stack, one goal. He got an offer at month 11.",
      },
      {
        heading: "Case study 2: Upskilling while working full-time",
        body: "Priya was a backend Java developer who wanted to add machine learning skills. She had only 45 minutes per day to study. Her roadmap used a crawl-walk-run structure: Python basics for two weeks, NumPy/Pandas for four weeks, then scikit-learn. She skipped deep learning entirely in year one. Small daily blocks, scoped narrowly, compounded into a genuine ML skill set over eight months.",
      },
      {
        heading: "Case study 3: Self-directed data science degree",
        body: "Leon couldn't afford a master's programme. He mapped out a two-year curriculum equivalent using open courseware: statistics (MIT OCW), linear algebra (3Blue1Brown + Gilbert Strang), machine learning (Andrew Ng's Coursera), and a capstone project publishing real research. The roadmap was reviewed monthly and the curriculum adjusted as his interests sharpened. His Kaggle portfolio eventually landed him a DS role at a mid-size startup.",
      },
      {
        heading: "What these cases share",
        body: "All three learners had a time-boxed, specific goal. All three cut scope aggressively rather than trying to learn everything. All three shipped something — a job application, a Kaggle notebook, a portfolio — to force real feedback. A roadmap without a deliverable is a reading list. A deliverable turns a plan into a proof.",
      },
    ],
  },
  {
    slug: "industry-specific-roadmap-guides",
    title: "Industry-Specific Roadmap Guides",
    tag: "Guide",
    color: "blue",
    readTime: "8 min read",
    sections: [
      {
        heading: "Software engineering",
        body: "Start with computer science fundamentals: data structures, algorithms, and one systems language (C or Go). Layer in web or mobile depending on your target role. The most overlooked skill: reading other people's code. Spend at least 20% of your time on GitHub reading production codebases. Interviews reward problem-solving fluency, not tutorial completion.",
      },
      {
        heading: "Data science and machine learning",
        body: "Statistics and probability come before any ML framework. Without them, you're turning knobs you don't understand. Cover linear algebra and calculus at an intuition level, then move to Python, pandas, and scikit-learn. Deep learning is a specialisation, not a prerequisite. Most data science jobs never touch a neural network.",
      },
      {
        heading: "UI/UX design",
        body: "Learn design principles (hierarchy, contrast, whitespace, colour theory) before opening any tool. Then Figma. Build your portfolio by redesigning real products — broken apps, clunky onboarding flows — and document your reasoning, not just the output. Recruiters want to see how you think, not just what you made.",
      },
      {
        heading: "Product management",
        body: "PM roadmaps are less about technical skills and more about frameworks: discovery, prioritisation, metrics, and stakeholder communication. Study real PRDs and PM write-ups published online. Build products — even tiny side projects — to understand the tradeoffs you'll be making in a real role.",
      },
      {
        heading: "Cybersecurity",
        body: "Networking fundamentals first: TCP/IP, DNS, HTTP, firewalls. Then operating systems at the command line. Pick a specialisation early — offensive (pen testing), defensive (SOC analysis), or cloud security — since the skill trees diverge quickly. CTF (Capture the Flag) competitions provide structured, gamified practice that maps directly to job skills.",
      },
      {
        heading: "Adapting any industry roadmap",
        body: "Every industry roadmap you find online is someone else's path. Use it as a scaffold, not a prescription. Identify which skills are table stakes for entry-level roles (check job postings), and cut everything else for year one. Add depth after you're employed — on-the-job learning is faster than any course.",
      },
    ],
  },
  {
    slug: "building-a-learning-community",
    title: "Building a Learning Community",
    tag: "Community",
    color: "amber",
    readTime: "5 min read",
    sections: [
      {
        heading: "Why learning alone has a ceiling",
        body: "Solo learning is efficient for absorbing information but poor at exposing your blind spots. A community surfaces questions you didn't know to ask, shares resources you'd never have found, and provides the social signal that keeps motivation alive through the slow middle months of a long roadmap.",
      },
      {
        heading: "Find the right community before starting one",
        body: "Before building your own group, spend two to four weeks in existing communities relevant to your field — Discord servers, subreddits, Slack workspaces, local meetups. Identify what's missing: no beginner-friendly space, no accountability structures, no project-sharing culture. Build the thing that doesn't exist, not a replica of what's already there.",
      },
      {
        heading: "Anchor the community around shared work",
        body: "The best learning communities aren't organised around passive discussion — they're organised around shared doing. Weekly build challenges, paired code reviews, monthly show-and-tell sessions, or group study sprints create recurring reasons to show up. A community with nothing to do together slowly stops doing anything together.",
      },
      {
        heading: "Default to async and document everything",
        body: "Synchronous calls are high-bandwidth but exclude people in different time zones and skill levels. Async — structured forum posts, recorded walkthroughs, shared notes — scales better and creates a searchable archive that benefits members who join six months later.",
      },
      {
        heading: "Recognise contribution, not just output",
        body: "Communities die when only the most advanced members get visibility. Celebrate the person who asked the best question, who answered five beginner questions this week, who wrote up a meeting summary. Contribution comes in more forms than shipping code, and recognition structures that reflect that retain beginners.",
      },
    ],
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

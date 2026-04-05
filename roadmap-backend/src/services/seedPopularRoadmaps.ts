import mongoose from "mongoose";
import Roadmap from "../models/roadmap.model";
import RoadmapNode from "../models/roadmap_node.model";
import Resource from "../models/resource.model";
import ConnectDatabase from "../lib/connectDb";
import dotenv from "dotenv";

dotenv.config();

/**
 * Popular roadmaps with pre-defined content (no AI needed - instant!)
 * These are comprehensive roadmaps with real resources
 */
const popularRoadmapsWithContent = [
  {
    title: "Frontend Development",
    description: "Complete roadmap to become a frontend developer. Learn HTML, CSS, JavaScript, and modern frameworks like React.",
    category: "frontend",
    difficulty: "beginner",
    tags: ["html", "css", "javascript", "react", "vue", "angular", "typescript"],
    estimatedDuration: { value: 16, unit: "weeks" },
    nodes: [
      {
        title: "HTML Fundamentals",
        description: "Learn the building blocks of web pages",
        nodeType: "topic",
        estimatedDuration: { value: 1, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", resourceType: "documentation", description: "Complete HTML reference" },
          { title: "HTML Crash Course", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", resourceType: "video", description: "Traversy Media HTML course" },
          { title: "freeCodeCamp HTML", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", resourceType: "course", description: "Interactive HTML exercises" },
        ],
        children: [
          { title: "Semantic HTML", description: "Write meaningful, accessible HTML", nodeType: "skill", estimatedDuration: { value: 2, unit: "days" }, resources: [{ title: "Semantic HTML Guide", url: "https://www.freecodecamp.org/news/semantic-html5-elements/", resourceType: "article", description: "Complete guide" }], children: [] },
          { title: "Forms & Validation", description: "Create interactive forms", nodeType: "skill", estimatedDuration: { value: 3, unit: "days" }, resources: [{ title: "HTML Forms MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms", resourceType: "documentation", description: "Forms guide" }], children: [] },
        ]
      },
      {
        title: "CSS Styling",
        description: "Master CSS for beautiful, responsive designs",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "CSS-Tricks", url: "https://css-tricks.com/guides/", resourceType: "documentation", description: "CSS guides and tutorials" },
          { title: "CSS Crash Course", url: "https://www.youtube.com/watch?v=yfoY53QXEnI", resourceType: "video", description: "Traversy Media CSS" },
          { title: "Flexbox Froggy", url: "https://flexboxfroggy.com/", resourceType: "tool", description: "Learn Flexbox interactively" },
        ],
        children: [
          { title: "Flexbox & Grid", description: "Modern CSS layouts", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "CSS Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/", resourceType: "article", description: "Complete Grid guide" }], children: [] },
          { title: "Responsive Design", description: "Build for all screen sizes", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "Responsive Web Design", url: "https://web.dev/responsive-web-design-basics/", resourceType: "article", description: "Google guide" }], children: [] },
        ]
      },
      {
        title: "JavaScript Essentials",
        description: "Learn JavaScript from basics to advanced concepts",
        nodeType: "topic",
        estimatedDuration: { value: 4, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info/", resourceType: "documentation", description: "Modern JavaScript tutorial" },
          { title: "JavaScript Crash Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", resourceType: "video", description: "Traversy Media JS" },
          { title: "freeCodeCamp JavaScript", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", resourceType: "course", description: "Interactive JS course" },
        ],
        children: [
          { title: "DOM Manipulation", description: "Interact with web pages", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "DOM Tutorial", url: "https://www.youtube.com/watch?v=0ik6X4DJKCc", resourceType: "video", description: "DOM manipulation" }], children: [] },
          { title: "ES6+ Features", description: "Modern JavaScript syntax", nodeType: "skill", estimatedDuration: { value: 5, unit: "days" }, resources: [{ title: "ES6 Features", url: "https://www.youtube.com/watch?v=NCwa_xi0Uuc", resourceType: "video", description: "ES6 tutorial" }], children: [] },
          { title: "Async JavaScript", description: "Promises, async/await", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Async JS", url: "https://javascript.info/async", resourceType: "documentation", description: "Async guide" }], children: [] },
        ]
      },
      {
        title: "React.js",
        description: "Build modern UIs with React",
        nodeType: "topic",
        estimatedDuration: { value: 4, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "React Official Docs", url: "https://react.dev/learn", resourceType: "documentation", description: "Official React documentation" },
          { title: "React Course", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", resourceType: "video", description: "freeCodeCamp React course" },
          { title: "Scrimba React", url: "https://scrimba.com/learn/learnreact", resourceType: "course", description: "Interactive React course" },
        ],
        children: [
          { title: "Components & Props", description: "Building blocks of React", nodeType: "skill", estimatedDuration: { value: 5, unit: "days" }, resources: [{ title: "Components Guide", url: "https://react.dev/learn/your-first-component", resourceType: "documentation", description: "React components" }], children: [] },
          { title: "Hooks", description: "useState, useEffect, and more", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "React Hooks", url: "https://react.dev/reference/react/hooks", resourceType: "documentation", description: "Hooks reference" }], children: [] },
          { title: "State Management", description: "Redux, Context API", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Redux Tutorial", url: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts", resourceType: "documentation", description: "Redux guide" }], children: [] },
        ]
      },
      {
        title: "Build Tools & Deployment",
        description: "Modern development workflow",
        nodeType: "topic",
        estimatedDuration: { value: 1, unit: "weeks" },
        importance: "high",
        difficulty: "intermediate",
        resources: [
          { title: "Vite Documentation", url: "https://vitejs.dev/guide/", resourceType: "documentation", description: "Vite build tool" },
          { title: "Vercel Deployment", url: "https://vercel.com/docs", resourceType: "documentation", description: "Deploy your apps" },
        ],
        children: [
          { title: "Git & GitHub", description: "Version control", nodeType: "skill", estimatedDuration: { value: 3, unit: "days" }, resources: [{ title: "Git Tutorial", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", resourceType: "video", description: "Git crash course" }], children: [] },
        ]
      },
      {
        title: "Portfolio Project",
        description: "Build a complete frontend project",
        nodeType: "project",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Frontend Mentor", url: "https://www.frontendmentor.io/challenges", resourceType: "tool", description: "Real-world projects" },
        ],
        children: []
      }
    ]
  },
  {
    title: "Backend Development with Node.js",
    description: "Master backend development with Node.js, Express, and databases. Build scalable APIs and server-side applications.",
    category: "backend",
    difficulty: "intermediate",
    tags: ["nodejs", "express", "mongodb", "postgresql", "api", "rest", "graphql"],
    estimatedDuration: { value: 14, unit: "weeks" },
    nodes: [
      {
        title: "Node.js Fundamentals",
        description: "Learn Node.js runtime and core concepts",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "Node.js Official Docs", url: "https://nodejs.org/docs/latest/api/", resourceType: "documentation", description: "Official Node.js documentation" },
          { title: "Node.js Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", resourceType: "video", description: "freeCodeCamp Node.js course" },
          { title: "The Odin Project Node", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", resourceType: "course", description: "Comprehensive Node.js path" },
        ],
        children: [
          { title: "Modules & NPM", description: "Package management", nodeType: "skill", estimatedDuration: { value: 3, unit: "days" }, resources: [{ title: "NPM Guide", url: "https://docs.npmjs.com/cli/v9/commands", resourceType: "documentation", description: "NPM documentation" }], children: [] },
          { title: "File System & Streams", description: "Work with files", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "FS Module", url: "https://nodejs.org/api/fs.html", resourceType: "documentation", description: "File system docs" }], children: [] },
        ]
      },
      {
        title: "Express.js Framework",
        description: "Build web servers with Express",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Express Docs", url: "https://expressjs.com/en/guide/routing.html", resourceType: "documentation", description: "Express.js guide" },
          { title: "Express Crash Course", url: "https://www.youtube.com/watch?v=L72fhGm1tfE", resourceType: "video", description: "Traversy Media Express" },
        ],
        children: [
          { title: "Routing & Middleware", description: "Handle requests", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Middleware Guide", url: "https://expressjs.com/en/guide/using-middleware.html", resourceType: "documentation", description: "Middleware docs" }], children: [] },
          { title: "Error Handling", description: "Handle errors properly", nodeType: "skill", estimatedDuration: { value: 3, unit: "days" }, resources: [{ title: "Error Handling", url: "https://expressjs.com/en/guide/error-handling.html", resourceType: "documentation", description: "Error handling guide" }], children: [] },
        ]
      },
      {
        title: "Databases",
        description: "Store and retrieve data",
        nodeType: "topic",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "MongoDB University", url: "https://learn.mongodb.com/", resourceType: "course", description: "Free MongoDB courses" },
          { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", resourceType: "documentation", description: "PostgreSQL guide" },
        ],
        children: [
          { title: "MongoDB & Mongoose", description: "NoSQL database", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Mongoose Docs", url: "https://mongoosejs.com/docs/", resourceType: "documentation", description: "Mongoose ODM" }], children: [] },
          { title: "SQL & PostgreSQL", description: "Relational database", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "SQL Tutorial", url: "https://www.w3schools.com/sql/", resourceType: "course", description: "SQL basics" }], children: [] },
        ]
      },
      {
        title: "Authentication & Security",
        description: "Secure your applications",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "JWT Authentication", url: "https://jwt.io/introduction", resourceType: "documentation", description: "JWT guide" },
          { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", resourceType: "documentation", description: "Security best practices" },
        ],
        children: [
          { title: "JWT & Sessions", description: "User authentication", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Auth Tutorial", url: "https://www.youtube.com/watch?v=mbsmsi7l3r4", resourceType: "video", description: "JWT auth tutorial" }], children: [] },
        ]
      },
      {
        title: "REST API Project",
        description: "Build a complete REST API",
        nodeType: "project",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "REST API Best Practices", url: "https://restfulapi.net/", resourceType: "documentation", description: "REST API guide" },
        ],
        children: []
      }
    ]
  },
  {
    title: "React Developer Path",
    description: "Master React.js and its ecosystem. Build modern, performant web applications with the most popular frontend library.",
    category: "frontend",
    difficulty: "intermediate",
    tags: ["react", "redux", "hooks", "nextjs", "typescript", "testing"],
    estimatedDuration: { value: 12, unit: "weeks" },
    nodes: [
      {
        title: "React Fundamentals",
        description: "Core React concepts",
        nodeType: "topic",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "React Official Tutorial", url: "https://react.dev/learn", resourceType: "documentation", description: "Official React docs" },
          { title: "React Course 2024", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", resourceType: "video", description: "freeCodeCamp React" },
        ],
        children: [
          { title: "JSX & Components", description: "React building blocks", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "JSX Guide", url: "https://react.dev/learn/writing-markup-with-jsx", resourceType: "documentation", description: "JSX documentation" }], children: [] },
          { title: "Props & State", description: "Data flow in React", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "State Guide", url: "https://react.dev/learn/state-a-components-memory", resourceType: "documentation", description: "State documentation" }], children: [] },
        ]
      },
      {
        title: "React Hooks",
        description: "Master all React hooks",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Hooks Reference", url: "https://react.dev/reference/react/hooks", resourceType: "documentation", description: "Complete hooks reference" },
          { title: "useHooks", url: "https://usehooks.com/", resourceType: "tool", description: "Custom hooks collection" },
        ],
        children: [
          { title: "useState & useEffect", description: "Basic hooks", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "useState", url: "https://react.dev/reference/react/useState", resourceType: "documentation", description: "useState docs" }], children: [] },
          { title: "Custom Hooks", description: "Create reusable hooks", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "Custom Hooks Guide", url: "https://react.dev/learn/reusing-logic-with-custom-hooks", resourceType: "documentation", description: "Custom hooks" }], children: [] },
        ]
      },
      {
        title: "State Management",
        description: "Manage complex state",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "high",
        difficulty: "intermediate",
        resources: [
          { title: "Redux Toolkit", url: "https://redux-toolkit.js.org/", resourceType: "documentation", description: "Modern Redux" },
          { title: "Zustand", url: "https://zustand-demo.pmnd.rs/", resourceType: "documentation", description: "Simple state management" },
        ],
        children: [
          { title: "Context API", description: "Built-in state sharing", nodeType: "skill", estimatedDuration: { value: 3, unit: "days" }, resources: [{ title: "Context", url: "https://react.dev/learn/passing-data-deeply-with-context", resourceType: "documentation", description: "Context docs" }], children: [] },
          { title: "Redux Toolkit", description: "Global state management", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "RTK Tutorial", url: "https://redux-toolkit.js.org/tutorials/quick-start", resourceType: "documentation", description: "RTK quick start" }], children: [] },
        ]
      },
      {
        title: "Next.js Framework",
        description: "Full-stack React framework",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "high",
        difficulty: "intermediate",
        resources: [
          { title: "Next.js Docs", url: "https://nextjs.org/docs", resourceType: "documentation", description: "Official Next.js docs" },
          { title: "Next.js Course", url: "https://nextjs.org/learn", resourceType: "course", description: "Official Next.js course" },
        ],
        children: [
          { title: "App Router", description: "Modern routing", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "App Router", url: "https://nextjs.org/docs/app", resourceType: "documentation", description: "App Router docs" }], children: [] },
          { title: "Server Components", description: "Server-side React", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "Server Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components", resourceType: "documentation", description: "RSC docs" }], children: [] },
        ]
      },
      {
        title: "Full React Project",
        description: "Build a complete React application",
        nodeType: "project",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Project Ideas", url: "https://www.freecodecamp.org/news/react-projects-for-beginners-easy-ideas-with-code/", resourceType: "article", description: "React project ideas" },
        ],
        children: []
      }
    ]
  },
  {
    title: "Python for Data Science",
    description: "Learn Python programming and data science. Master pandas, numpy, machine learning, and data visualization.",
    category: "data-science",
    difficulty: "intermediate",
    tags: ["python", "pandas", "numpy", "machine-learning", "data-visualization", "jupyter"],
    estimatedDuration: { value: 16, unit: "weeks" },
    nodes: [
      {
        title: "Python Basics",
        description: "Learn Python programming fundamentals",
        nodeType: "topic",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", resourceType: "documentation", description: "Official Python tutorial" },
          { title: "Python for Everybody", url: "https://www.py4e.com/", resourceType: "course", description: "Free Python course" },
          { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", resourceType: "book", description: "Practical Python book" },
        ],
        children: [
          { title: "Variables & Data Types", description: "Python basics", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "Python Data Types", url: "https://www.w3schools.com/python/python_datatypes.asp", resourceType: "documentation", description: "Data types" }], children: [] },
          { title: "Functions & Classes", description: "Object-oriented Python", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "OOP Python", url: "https://realpython.com/python3-object-oriented-programming/", resourceType: "article", description: "OOP guide" }], children: [] },
        ]
      },
      {
        title: "Data Analysis with Pandas",
        description: "Master data manipulation",
        nodeType: "topic",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", resourceType: "documentation", description: "Official pandas docs" },
          { title: "Kaggle Pandas Course", url: "https://www.kaggle.com/learn/pandas", resourceType: "course", description: "Free pandas course" },
        ],
        children: [
          { title: "DataFrames", description: "Core pandas structure", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "10 Minutes to Pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", resourceType: "documentation", description: "Quick start" }], children: [] },
          { title: "Data Cleaning", description: "Handle missing data", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Data Cleaning", url: "https://www.kaggle.com/learn/data-cleaning", resourceType: "course", description: "Kaggle course" }], children: [] },
        ]
      },
      {
        title: "Data Visualization",
        description: "Create compelling visualizations",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "high",
        difficulty: "intermediate",
        resources: [
          { title: "Matplotlib Tutorial", url: "https://matplotlib.org/stable/tutorials/", resourceType: "documentation", description: "Matplotlib guide" },
          { title: "Seaborn Tutorial", url: "https://seaborn.pydata.org/tutorial.html", resourceType: "documentation", description: "Seaborn guide" },
        ],
        children: [
          { title: "Matplotlib & Seaborn", description: "Static visualizations", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Visualization Course", url: "https://www.kaggle.com/learn/data-visualization", resourceType: "course", description: "Kaggle viz course" }], children: [] },
        ]
      },
      {
        title: "Machine Learning Basics",
        description: "Introduction to ML with scikit-learn",
        nodeType: "topic",
        estimatedDuration: { value: 4, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Scikit-learn Docs", url: "https://scikit-learn.org/stable/user_guide.html", resourceType: "documentation", description: "Official ML library" },
          { title: "ML Course", url: "https://www.kaggle.com/learn/intro-to-machine-learning", resourceType: "course", description: "Kaggle ML intro" },
        ],
        children: [
          { title: "Supervised Learning", description: "Classification & regression", nodeType: "skill", estimatedDuration: { value: 2, unit: "weeks" }, resources: [{ title: "Supervised Learning", url: "https://scikit-learn.org/stable/supervised_learning.html", resourceType: "documentation", description: "ML algorithms" }], children: [] },
          { title: "Model Evaluation", description: "Metrics and validation", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Model Evaluation", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", resourceType: "documentation", description: "Evaluation guide" }], children: [] },
        ]
      },
      {
        title: "Data Science Project",
        description: "Complete end-to-end data science project",
        nodeType: "project",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Kaggle Competitions", url: "https://www.kaggle.com/competitions", resourceType: "tool", description: "Real-world datasets" },
        ],
        children: []
      }
    ]
  },
  {
    title: "DevOps Engineering",
    description: "Learn DevOps practices, CI/CD, containerization, and cloud infrastructure. Master Docker, Kubernetes, and AWS.",
    category: "devops",
    difficulty: "advanced",
    tags: ["docker", "kubernetes", "aws", "ci-cd", "terraform", "jenkins", "linux"],
    estimatedDuration: { value: 18, unit: "weeks" },
    nodes: [
      {
        title: "Linux & Command Line",
        description: "Master Linux fundamentals",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "beginner",
        resources: [
          { title: "Linux Journey", url: "https://linuxjourney.com/", resourceType: "course", description: "Free Linux course" },
          { title: "Linux Command Line", url: "https://www.youtube.com/watch?v=ZtqBQ68cfJc", resourceType: "video", description: "freeCodeCamp Linux" },
        ],
        children: [
          { title: "Bash Scripting", description: "Automate with bash", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Bash Guide", url: "https://mywiki.wooledge.org/BashGuide", resourceType: "documentation", description: "Bash tutorial" }], children: [] },
        ]
      },
      {
        title: "Docker Containerization",
        description: "Container applications with Docker",
        nodeType: "topic",
        estimatedDuration: { value: 3, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "Docker Docs", url: "https://docs.docker.com/get-started/", resourceType: "documentation", description: "Official Docker docs" },
          { title: "Docker Course", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", resourceType: "video", description: "freeCodeCamp Docker" },
        ],
        children: [
          { title: "Dockerfile & Images", description: "Build containers", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Dockerfile Reference", url: "https://docs.docker.com/engine/reference/builder/", resourceType: "documentation", description: "Dockerfile docs" }], children: [] },
          { title: "Docker Compose", description: "Multi-container apps", nodeType: "skill", estimatedDuration: { value: 4, unit: "days" }, resources: [{ title: "Compose Docs", url: "https://docs.docker.com/compose/", resourceType: "documentation", description: "Docker Compose" }], children: [] },
        ]
      },
      {
        title: "Kubernetes",
        description: "Container orchestration",
        nodeType: "topic",
        estimatedDuration: { value: 4, unit: "weeks" },
        importance: "critical",
        difficulty: "advanced",
        resources: [
          { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", resourceType: "documentation", description: "Official K8s docs" },
          { title: "K8s Course", url: "https://www.youtube.com/watch?v=X48VuDVv0do", resourceType: "video", description: "TechWorld K8s" },
        ],
        children: [
          { title: "Pods & Deployments", description: "Core K8s concepts", nodeType: "skill", estimatedDuration: { value: 2, unit: "weeks" }, resources: [{ title: "K8s Concepts", url: "https://kubernetes.io/docs/concepts/", resourceType: "documentation", description: "K8s concepts" }], children: [] },
          { title: "Services & Ingress", description: "Networking in K8s", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Services", url: "https://kubernetes.io/docs/concepts/services-networking/service/", resourceType: "documentation", description: "K8s services" }], children: [] },
        ]
      },
      {
        title: "CI/CD Pipelines",
        description: "Automate software delivery",
        nodeType: "topic",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "intermediate",
        resources: [
          { title: "GitHub Actions", url: "https://docs.github.com/en/actions", resourceType: "documentation", description: "GitHub Actions docs" },
          { title: "Jenkins Tutorial", url: "https://www.jenkins.io/doc/tutorials/", resourceType: "documentation", description: "Jenkins tutorials" },
        ],
        children: [
          { title: "GitHub Actions", description: "GitHub CI/CD", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "Actions Guide", url: "https://docs.github.com/en/actions/quickstart", resourceType: "documentation", description: "Quick start" }], children: [] },
        ]
      },
      {
        title: "AWS Cloud",
        description: "Cloud infrastructure on AWS",
        nodeType: "topic",
        estimatedDuration: { value: 4, unit: "weeks" },
        importance: "high",
        difficulty: "advanced",
        resources: [
          { title: "AWS Training", url: "https://aws.amazon.com/training/", resourceType: "course", description: "Official AWS training" },
          { title: "AWS freeCodeCamp", url: "https://www.youtube.com/watch?v=ulprqHHWlng", resourceType: "video", description: "AWS course" },
        ],
        children: [
          { title: "EC2 & S3", description: "Compute and storage", nodeType: "skill", estimatedDuration: { value: 1, unit: "weeks" }, resources: [{ title: "EC2 Docs", url: "https://docs.aws.amazon.com/ec2/", resourceType: "documentation", description: "EC2 documentation" }], children: [] },
          { title: "Terraform", description: "Infrastructure as Code", nodeType: "skill", estimatedDuration: { value: 2, unit: "weeks" }, resources: [{ title: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs", resourceType: "documentation", description: "Terraform docs" }], children: [] },
        ]
      },
      {
        title: "DevOps Project",
        description: "Deploy a complete application with CI/CD",
        nodeType: "project",
        estimatedDuration: { value: 2, unit: "weeks" },
        importance: "critical",
        difficulty: "advanced",
        resources: [
          { title: "DevOps Projects", url: "https://www.youtube.com/results?search_query=devops+project", resourceType: "video", description: "DevOps project tutorials" },
        ],
        children: []
      }
    ]
  }
];

const validResourceTypes = ["article", "video", "course", "book", "documentation", "podcast", "cheatsheet", "tool", "other"];

/**
 * Seed popular roadmaps with full content into the database
 */
export async function seedPopularRoadmaps() {
  try {
    console.log("🚀 Starting to seed popular roadmaps with content...");

    for (const roadmapData of popularRoadmapsWithContent) {
      // Check if roadmap already exists
      const existing = await Roadmap.findOne({
        title: roadmapData.title,
        isPreGenerated: true,
      });

      if (existing) {
        console.log(`⏭️  Roadmap "${roadmapData.title}" already exists, skipping...`);
        continue;
      }

      // Create the roadmap
      const roadmap = await Roadmap.create({
        title: roadmapData.title,
        description: roadmapData.description,
        category: roadmapData.category,
        difficulty: roadmapData.difficulty,
        tags: roadmapData.tags,
        estimatedDuration: roadmapData.estimatedDuration,
        isPublished: true,
        isPreGenerated: true,
        stats: {
          views: Math.floor(Math.random() * 1000) + 100,
          completions: Math.floor(Math.random() * 100) + 10,
          averageRating: 4.5 + Math.random() * 0.4,
          ratingsCount: Math.floor(Math.random() * 50) + 5,
        },
        qualityScore: 100,
        needsRegeneration: false,
      });

      console.log(`✅ Created roadmap: ${roadmap.title}`);

      // Create nodes recursively
      let positionCounter = 0;
      
      const createNodes = async (
        nodes: any[],
        roadmapId: mongoose.Types.ObjectId,
        depth: number = 0,
        parentNodeId?: mongoose.Types.ObjectId
      ): Promise<void> => {
        for (const nodeData of nodes) {
          // Create resources first
          let resourceIds: mongoose.Types.ObjectId[] = [];
          if (nodeData.resources && nodeData.resources.length > 0) {
            const resourceDocs = nodeData.resources.map((resource: any) => ({
              title: resource.title,
              description: resource.description || "",
              url: resource.url,
              resourceType: validResourceTypes.includes(resource.resourceType?.toLowerCase()) 
                ? resource.resourceType.toLowerCase() 
                : "other",
              contentType: "free",
              isCommunityContributed: true,
              isApproved: true,
              difficulty: nodeData.difficulty || "beginner",
              stats: { views: 0, clicks: 0, rating: 0, ratingsCount: 0 },
            }));

            try {
              const createdResources = await Resource.insertMany(resourceDocs, { ordered: false });
              resourceIds = createdResources.map(r => r._id as mongoose.Types.ObjectId);
            } catch (err: any) {
              console.warn(`⚠️  Some resources failed for "${nodeData.title}":`, err.message);
            }
          }

          // Create the node
          const nodeDoc = await RoadmapNode.create({
            roadmap: roadmapId,
            title: nodeData.title,
            description: nodeData.description || "",
            depth,
            position: positionCounter++,
            nodeType: nodeData.nodeType || "topic",
            estimatedDuration: nodeData.estimatedDuration,
            isOptional: nodeData.importance === "low",
            resources: resourceIds,
            prerequisites: parentNodeId ? [parentNodeId] : [],
            metadata: {
              keywords: nodeData.title.toLowerCase().split(/\s+/).slice(0, 5),
              difficulty: nodeData.difficulty || "beginner",
              importance: nodeData.importance || "medium",
            },
          });

          // Create children recursively
          if (nodeData.children && nodeData.children.length > 0) {
            await createNodes(nodeData.children, roadmapId, depth + 1, nodeDoc._id);
          }
        }
      };

      await createNodes(roadmapData.nodes, roadmap._id as mongoose.Types.ObjectId);
      console.log(`   📚 Added ${positionCounter} nodes to "${roadmap.title}"`);
    }

    console.log("🎉 Finished seeding all popular roadmaps!");
    return { success: true, count: popularRoadmapsWithContent.length };
  } catch (error) {
    console.error("❌ Error seeding popular roadmaps:", error);
    throw error;
  }
}

/**
 * Clear all pre-generated roadmaps (useful for testing)
 */
export async function clearPreGeneratedRoadmaps() {
  try {
    console.log("🧹 Clearing pre-generated roadmaps...");

    const preGenerated = await Roadmap.find({ isPreGenerated: true });

    for (const roadmap of preGenerated) {
      // Delete associated nodes
      const nodes = await RoadmapNode.find({ roadmap: roadmap._id });
      for (const node of nodes) {
        // Delete resources
        if (node.resources && node.resources.length > 0) {
          await Resource.deleteMany({ _id: { $in: node.resources } });
        }
      }
      await RoadmapNode.deleteMany({ roadmap: roadmap._id });
      await roadmap.deleteOne();
    }

    console.log(`🗑️  Cleared ${preGenerated.length} pre-generated roadmaps!`);
    return { success: true, deleted: preGenerated.length };
  } catch (error) {
    console.error("❌ Error clearing pre-generated roadmaps:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  ConnectDatabase()
    .then(async () => {
      await seedPopularRoadmaps();
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

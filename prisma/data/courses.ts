export const coursesData = [
  {
    slug: "ai-agents-engineering",
    title: "AI Agents Engineering Bootcamp",
    subtitle: "8-Week Production AI Agents Journey",
    description: "Learn to build, orchestrate, and deploy autonomous AI agents. Move beyond simple chatbots to multi-agent systems and stateful AI workflows using LangGraph and LangChain.",
    price: 599.00,
    priceINR: 49999,
    priceUSD: 599,
    image: "/courses/ai-agents.png",
    heroImage: "/courses/ai-agents-hero.png",
    category: "AI Engineering",
    level: "Intermediate",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Autonomous Research Agent",
        description: "Design an agent system for automated web research and reporting.",
        icon: "search"
      },
      {
        title: "Multi-Agent System",
        description: "Orchestrate multiple agents using CrewAI or AutoGen.",
        icon: "layers"
      },
      {
        title: "PDF Knowledge RAG",
        description: "Build a state-of-the-art RAG system with complex retrieval.",
        icon: "cpu"
      }
    ],
    tools: [
      { name: "OpenAI", icon: "openai" },
      { name: "LangChain", icon: "langchain" },
      { name: "Python", icon: "python" }
    ],
    requirements: [
      "Python programming proficiency",
      "Basic understanding of LLMs",
      "Willingness to build complex systems"
    ],
    curriculum: [
      {
        id: "01",
        title: "Foundations of AI Agents",
        meta: "Week 1",
        lessons: [
          { title: "AI agents vs LLM apps, real-world use cases, and agent architecture basics", type: "video" },
          { title: "Reason-act-observe loops, tools, APIs, and system design essentials", type: "live" }
        ],
        practice: "Build a basic AI assistant using an LLM API",
        outcome: "Students understand agent architecture and build a first working agent.",
        isOpen: true
      },
      {
        id: "02",
        title: "Prompt Engineering and Control",
        meta: "Week 2",
        lessons: [
          { title: "Chain-of-thought, ReAct, few-shot prompting, and system prompt design", type: "live" },
          { title: "Tool calling, structured outputs, prompt debugging, and optimization", type: "video" }
        ],
        practice: "Build a reasoning-based agent with tool usage",
        outcome: "Students control LLM behavior more reliably and intelligently."
      },
      {
        id: "03",
        title: "LangChain and Tool-Based Agents",
        meta: "Week 3",
        lessons: [
          { title: "Chains, tools, memory, execution flow, and decision-making patterns", type: "video" },
          { title: "Multi-tool agents with search, calculator, and API integrations", type: "live" }
        ],
        practice: "Build a multi-tool agent",
        outcome: "Students build modular agents using tools and memory."
      },
      {
        id: "04",
        title: "RAG Systems",
        meta: "Week 4",
        lessons: [
          { title: "Embeddings, vector databases, chunking strategies, and document retrieval", type: "live" },
          { title: "Retrieval optimization and hallucination-reduction techniques", type: "video" }
        ],
        practice: "Build a PDF knowledge chatbot",
        outcome: "Students create knowledge-based AI systems for real applications."
      },
      {
        id: "05",
        title: "LangGraph Workflows",
        meta: "Week 5",
        lessons: [
          { title: "State machines, planner-executor flows, and looping agent workflows", type: "video" },
          { title: "Fallbacks, error handling, and structured multi-step design", type: "live" }
        ],
        practice: "Build a planner-executor agent system",
        outcome: "Students design reliable multi-step AI workflows."
      },
      {
        id: "06",
        title: "Multi-Agent Systems",
        meta: "Week 6",
        lessons: [
          { title: "AutoGen, CrewAI, collaboration patterns, and agent communication", type: "live" },
          { title: "Task delegation, role-based agents, and system scaling concepts", type: "video" }
        ],
        practice: "Build a research-plus-writer multi-agent system",
        outcome: "Students build collaborative AI systems with multiple agents."
      },
      {
        id: "07",
        title: "Production AI Systems",
        meta: "Week 7",
        lessons: [
          { title: "Deployment with Streamlit/FastAPI, logging, monitoring, and observability", type: "video" },
          { title: "Cost optimization, retries, guardrails, and safety handling", type: "live" }
        ],
        practice: "Deploy an AI agent web app with logging",
        outcome: "Students build production-ready AI applications."
      },
      {
        id: "08",
        title: "Evaluation and Capstone",
        meta: "Week 8",
        lessons: [
          { title: "Evaluation, debugging, tracing, benchmarking, and optimization workflows", type: "live" },
          { title: "Final capstone: full AI agent system with deployment and testing", type: "live" }
        ],
        practice: "Build a final portfolio project",
        outcome: "Students complete a portfolio-ready AI system."
      }
    ],
    features: [
      "Design and deploy autonomous AI agents using LangChain & RAG",
      "Multi-agent orchestration with CrewAI or AutoGen",
      "Production-level AI system design",
      "ISO-Certified Program"
    ]
  },
  {
    slug: "mern-stack-ai",
    title: "MERN + AI Job-Ready Bootcamp",
    subtitle: "Become a Full-Stack Developer with AI Skills",
    description: "Master full-stack development using MongoDB, Express, React, and Node.js—enhanced with AI tools, APIs, and modern workflows. Build production-ready applications and become job-ready in 3–6 months.",
    price: 399.00,
    priceINR: 34999,
    priceUSD: 399,
    image: "/courses/mern-ai.png",
    heroImage: "/courses/mern-hero.png",
    category: "Fullstack Development",
    level: "Professional",
    duration: "12 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Full-Stack Dashboard Application",
        description: "Build a responsive dashboard with full CRUD and Auth.",
        icon: "layout"
      },
      {
        title: "AI Chatbot Integration Project",
        description: "Integrate a custom AI chatbot using OpenAI API.",
        icon: "bot"
      },
      {
        title: "Production-Level Portfolio Website",
        description: "Deploy a fleet of production-ready fullstack apps.",
        icon: "verified"
      },
      {
        title: "End-to-End MERN + AI Application",
        description: "Develop a complete application from scratch with integrated AI features.",
        icon: "auto_awesome"
      }
    ],
    tools: [
      { name: "MongoDB", icon: "mongodb" },
      { name: "Express.js", icon: "express" },
      { name: "React.js", icon: "react" },
      { name: "Node.js", icon: "node" },
      { name: "APIs & AI Tools", icon: "openai" },
      { name: "Git & Deployment", icon: "git" }
    ],
    requirements: [
      "Basic knowledge of JavaScript and web fundamentals is helpful but not mandatory.",
      "Beginners with basic programming understanding",
      "Developers looking to upgrade into full-stack + AI",
      "Career switchers entering software development"
    ],
    curriculum: [
      {
        id: "01",
        title: "Web Foundations",
        meta: "Week 1",
        lessons: [
          { title: "Semantic HTML & SEO Basics", type: "video" },
          { title: "Flexbox & Tailwind CSS", type: "live" }
        ],
        practice: "Build a responsive landing page with AI",
        outcome: "Can build mobile-first layouts using Tailwind."
      },
      {
        id: "02",
        title: "JavaScript Mastery",
        meta: "Week 2",
        lessons: [
          { title: "ES6+ Essentials & Async JS", type: "live" },
          { title: "Handling APIs & Fetch", type: "video" }
        ],
        practice: "Build an API-based mini app",
        outcome: "Can handle asynchronous operations comfortably."
      },
      {
        id: "03",
        title: "React Core",
        meta: "Week 3",
        lessons: [
          { title: "JSX, Components & Props", type: "video" },
          { title: "State Management & useEffect", type: "live" }
        ],
        practice: "Build a multi-page interactive React app",
        outcome: "Can create dynamic SPAs with React hooks."
      },
      {
        id: "04",
        title: "Advanced React & State",
        meta: "Week 4",
        lessons: [
          { title: "Context API & Global State", type: "live" },
          { title: "Auth Flow & Protected Routes", type: "video" }
        ],
        practice: "Implement secure authentication flow",
        outcome: "Can manage global state and secure routes."
      },
      {
        id: "05",
        title: "Frontend Production",
        meta: "Week 5",
        lessons: [
          { title: "Project Setup & CRUD Integration", type: "live" },
          { title: "UX Principles & Polish with AI", type: "video" }
        ],
        practice: "Finalize production dashboard frontend",
        outcome: "Complete a professional-grade frontend system."
      },
      {
        id: "06",
        title: "Node.js & Express",
        meta: "Week 6",
        lessons: [
          { title: "Server Setup & Middleware", type: "video" },
          { title: "REST API Design Principles", type: "live" }
        ],
        practice: "Build a scalable backend REST API",
        outcome: "Can build modular server-side applications."
      },
      {
        id: "07",
        title: "Databases & Prisma",
        meta: "Week 7",
        lessons: [
          { title: "MongoDB/SQL Schema Design", type: "live" },
          { title: "Relational CRUD & ORM", type: "video" }
        ],
        practice: "Design relational database schemas",
        outcome: "Can model data and optimize storage."
      },
      {
        id: "08",
        title: "Backend Security",
        meta: "Week 8",
        lessons: [
          { title: "JWT Auth & Password Hashing", type: "video" },
          { title: "RBAC & API Hardening", type: "live" }
        ],
        practice: "Implement a secure login system",
        outcome: "Can protect backend resources effectively."
      },
      {
        id: "09",
        title: "AI Tools & Workflows",
        meta: "Week 9",
        lessons: [
          { title: "Prompt Engineering & Code Gen", type: "live" },
          { title: "AI-Driven Testing & Docs", type: "video" }
        ],
        practice: "Automate tests and docs with AI",
        outcome: "Adopt AI-first development workflows."
      },
      {
        id: "10",
        title: "AI Integration",
        meta: "Week 10",
        lessons: [
          { title: "OpenAI API & Chatbots", type: "video" },
          { title: "AI Blog & Content Generators", type: "live" }
        ],
        practice: "Integrate custom AI features into app",
        outcome: "Can leverage LLMs for intelligent features."
      },
      {
        id: "11",
        title: "Deployment & CI/CD",
        meta: "Week 11",
        lessons: [
          { title: "Vercel & Environment Config", type: "live" },
          { title: "CI/CD Pipelines & Performance", type: "video" }
        ],
        practice: "Deploy fullstack system with CI/CD",
        outcome: "Understand software release lifecycle."
      },
      {
        id: "12",
        title: "Capstone & Portfolio",
        meta: "Week 12",
        lessons: [
          { title: "Capstone Finalization", type: "live" },
          { title: "Resume & Interview Prep", type: "live" }
        ],
        practice: "Complete portfolio-ready fullstack AI app",
        outcome: "Job-ready with a major live project."
      }
    ],
    features: [
      "Combines full-stack development with real AI integration",
      "Built for real-world production environments",
      "Live mentorship from industry professionals",
      "ISO-Certified Program"
    ]
  },
  {
    slug: "ml-job-ready",
    title: "ML Job Ready Bootcamp",
    subtitle: "Become Job-Ready in 3–6 Months",
    description: "Master machine learning and AI systems through live, mentor-led training. Build real-world projects, deploy models, and develop job-ready skills that companies actively look for.",
    price: 499.00,
    priceINR: 42999,
    priceUSD: 499,
    image: "/courses/ml-bootcamp.png",
    heroImage: "/courses/ml-hero.png",
    category: "AI & ML",
    level: "Professional",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Predictive Analytics System",
        description: "Build a regression model to predict future sales trends and business outcomes.",
        icon: "trending_up"
      },
      {
        title: "Customer Segmentation Model",
        description: "Use clustering to group customers based on behavior for targeted marketing.",
        icon: "groups"
      },
      {
        title: "Image Classification Project",
        description: "Develop a deep learning model for visual recognition and object detection.",
        icon: "camera_alt"
      },
      {
        title: "End-to-End ML Deployment Project",
        description: "Deploy a complete machine learning model into a production environment.",
        icon: "cloud_upload"
      }
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "Scikit-Learn", icon: "scikit-learn" },
      { name: "TensorFlow", icon: "tensorflow" },
      { name: "PyTorch", icon: "pytorch" },
      { name: "Pandas & NumPy", icon: "pandas" }
    ],
    requirements: [
      "No prior experience required—just consistency and commitment.",
      "Beginners with no coding background",
      "Working professionals switching to tech",
      "Graduates aiming for AI/ML careers"
    ],
    curriculum: [
      {
        id: "01",
        title: "Intro to Machine Learning & Statistics",
        meta: "Week 1",
        lessons: [
          { title: "What is ML? Types and Real-world applications", type: "video" },
          { title: "Descriptive Statistics: Mean, Median, Mode, Std Dev", type: "live" },
          { title: "Probability Basics & Inferential Statistics", type: "video" }
        ],
        practice: "Exploratory Data Analysis (EDA) on a basic dataset",
        outcome: "Students understand ML terminology and the mathematical backbone of data analysis.",
        isOpen: true
      },
      {
        id: "02",
        title: "Python for Data Science",
        meta: "Week 2",
        lessons: [
          { title: "NumPy for numerical operations", type: "live" },
          { title: "Pandas for data manipulation & Series/DataFrames", type: "video" },
          { title: "Matplotlib & Seaborn for data visualization", type: "live" }
        ],
        practice: "Automating data summary reports using Pandas",
        outcome: "Students can load, manipulate, and visualize datasets efficiently using Python."
      },
      {
        id: "03",
        title: "Data Preprocessing & Cleaning",
        meta: "Week 3",
        lessons: [
          { title: "Handling missing values & outliers", type: "video" },
          { title: "Feature scaling (Standardization/Normalization)", type: "live" },
          { title: "Encoding categorical variables", type: "video" }
        ],
        practice: "Preparing a 'dirty' dataset for machine learning models",
        outcome: "Students gain the ability to turn raw, messy data into high-quality training features."
      },
      {
        id: "04",
        title: "Supervised Learning (Regression)",
        meta: "Week 4",
        lessons: [
          { title: "Linear Regression & Multi-Linear Regression", type: "live" },
          { title: "Cost functions, Gradient Descent, & MSE/R2-score", type: "video" },
          { title: "Regularization (Lasso/Ridge regression)", type: "live" }
        ],
        practice: "House price prediction project",
        outcome: "Students can build predictive models for continuous values and evaluate performance."
      },
      {
        id: "05",
        title: "Supervised Learning (Classification)",
        meta: "Week 5",
        lessons: [
          { title: "Logistic Regression & Decision Trees", type: "video" },
          { title: "Random Forest & Support Vector Machines (SVM)", type: "live" },
          { title: "Confusion matrix, Precision, Recall, & F1-score", type: "video" }
        ],
        practice: "Spam detection or Loan approval project",
        outcome: "Students can build robust classification models and interpret evaluation metrics."
      },
      {
        id: "06",
        title: "Unsupervised Learning",
        meta: "Week 6",
        lessons: [
          { title: "Clustering (K-Means & Hierarchical)", type: "live" },
          { title: "Dimensionality Reduction (PCA basics)", type: "video" },
          { title: "Association Rule Learning", type: "live" }
        ],
        practice: "Customer segmentation project",
        outcome: "Students can identify patterns and group data in practical scenarios."
      },
      {
        id: "07",
        title: "Deep Learning Fundamentals",
        meta: "Week 7",
        lessons: [
          { title: "Neural networks, layers, and activation functions", type: "video" },
          { title: "TensorFlow/Keras introduction", type: "live" },
          { title: "When to use Deep Learning vs Traditional ML", type: "video" }
        ],
        practice: "Basic image classification demonstration",
        outcome: "Students gain a strong beginner-level understanding of deep learning concepts and tools."
      },
      {
        id: "08",
        title: "Capstone & Job Readiness",
        meta: "Week 8",
        lessons: [
          { title: "End-to-end ML project workflow", type: "live" },
          { title: "Model evaluation & deployment basics", type: "video" },
          { title: "GitHub portfolio polish & Interview prep", type: "live" }
        ],
        outcome: "Students complete a portfolio-ready ML project and strengthen job readiness.",
        isOpen: true
      }
    ],
    features: [
      "Live instructor-led sessions (no pre-recorded content)",
      "Real-world projects via Ramesys",
      "Resume + Interview Preparation",
      "ISO-Certified Program"
    ]
  },
  {
    slug: "python-ai",
    title: "Python AI Course",
    subtitle: "From Beginner to Job-Ready in 3–6 Months",
    description: "Learn Python, AI, and real-world application development through live, mentor-led training. Build projects using modern tools, APIs, and LLMs to become job-ready in today’s AI-driven tech industry.",
    price: 299.00,
    priceINR: 24999,
    priceUSD: 299,
    image: "/courses/python-ai.png",
    heroImage: "/courses/python-hero.png",
    category: "Programming",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Command-Line Automation Tool",
        description: "Understand core Python concepts by building a working automation script.",
        icon: "calculate"
      },
      {
        title: "Interactive Logic-Based Game",
        description: "Apply conditions and loops to create an interactive number-based game.",
        icon: "sports_esports"
      },
      {
        title: "Task Manager with File Handling",
        description: "Build a simple command-line tool to manage daily tasks and understand file I/O.",
        icon: "assignment"
      },
      {
        title: "API-Based AI Application",
        description: "Integrate external APIs and LLMs to build an intelligent application.",
        icon: "auto_awesome"
      }
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "APIs & Automation", icon: "api" },
      { name: "Git & GitHub", icon: "git" },
      { name: "SQL Basics", icon: "database" },
      { name: "AI Workflows", icon: "psychology" }
    ],
    requirements: [
      "No prior experience required—just consistency and willingness to learn.",
      "Complete beginners with no coding experience",
      "Working professionals switching to tech",
      "Students aiming for AI or development careers"
    ],
    curriculum: [
      {
        id: "01",
        title: "Python Foundations",
        meta: "Week 1",
        lessons: [
          { title: "Intro to Python: Installation and Hello World", type: "video" },
          { title: "Variables, Data Types, and Type Casting", type: "live" },
          { title: "Basic Operators: Arithmetic, Comparison & Logical", type: "video" }
        ],
        practice: "Building a basic BMI or Currency Converter calculator",
        outcome: "Students can write simple scripts and understand how computers store information.",
        isOpen: true
      },
      {
        id: "02",
        title: "Control Flow & Data Structures",
        meta: "Week 2",
        lessons: [
          { title: "Conditional Statements (If-Else, Match-Case)", type: "live" },
          { title: "Loops: For & While loops with range", type: "video" },
          { title: "List, Tuple, Set & Dictionary essentials", type: "live" }
        ],
        practice: "Creating a mini To-Do List or Grocery List app",
        outcome: "Students can implement logic and manage collections of data efficiently."
      },
      {
        id: "03",
        title: "Functions & Logic Building",
        meta: "Week 3",
        lessons: [
          { title: "Defining functions, parameters, and return values", type: "video" },
          { title: "Lambda functions & recursion basics", type: "live" },
          { title: "Scope, local vs global variables", type: "video" }
        ],
        practice: "Building a functional 'Rock, Paper, Scissors' game",
        outcome: "Students can write reusable, modular code and break down complex problems."
      },
      {
        id: "04",
        title: "File Handling & Error Handling",
        meta: "Week 4",
        lessons: [
          { title: "Reading/Writing text and CSV files", type: "live" },
          { title: "With-statement context managers", type: "video" },
          { title: "Try-Except blocks and debugging basics", type: "live" }
        ],
        practice: "Building a password manager that saves to a file",
        outcome: "Students can work with external data and build error-resistant programs."
      },
      {
        id: "05",
        title: "Advanced Python & Algorithms",
        meta: "Week 5",
        lessons: [
          { title: "List comprehensions and generators", type: "video" },
          { title: "Built-in modules: Math, Random, Datetime", type: "live" },
          { title: "Intro to basic sorting and searching algorithms", type: "video" }
        ],
        practice: "Solving logic puzzles using advanced Python features",
        outcome: "Students can write highly optimized and performance-oriented code."
      },
      {
        id: "06",
        title: "OOPs & Git Version Control",
        meta: "Week 6",
        lessons: [
          { title: "Classes, Objects, and __init__ method", type: "live" },
          { title: "Git basics: GitHub repos, commits, push workflow", type: "video" },
          { title: "Inheritance and portfolio hygiene", type: "live" }
        ],
        practice: "Student record class and publishing to GitHub",
        outcome: "Students can build class-based programs and publish work professionally."
      },
      {
        id: "07",
        title: "APIs, SQL & AI Basics",
        meta: "Week 7",
        lessons: [
          { title: "API basics with requests & JSON", type: "video" },
          { title: "SQL basics & data querying", type: "live" },
          { title: "Prompt Engineering & intro to LLM APIs", type: "video" }
        ],
        practice: "Weather app and prompt design practice",
        outcome: "Students gain exposure to data querying, APIs, and AI workflow concepts."
      },
      {
        id: "08",
        title: "Capstone & Job Readiness",
        meta: "Week 8",
        lessons: [
          { title: "Capstone planning and development", type: "live" },
          { title: "Testing, debugging, and cleanup", type: "video" },
          { title: "Resume, LinkedIn & GitHub polish", type: "live" }
        ],
        practice: "Final capstone, README, and mock interview",
        outcome: "Students finish with a portfolio-ready project and fresher job readiness.",
        isOpen: true
      }
    ],
    features: [
      "Designed for beginners and career switchers",
      "Focus on real-world application, not just theory",
      "Learn AI tools, APIs, and automation workflows",
      "ISO-Certified Program"
    ]
  },
  {
    slug: "sql-job-ready",
    title: "SQL Job-Ready Bootcamp",
    subtitle: "Become Job-Ready in Data & Analytics in 6 Weeks",
    description: "Master SQL from fundamentals to advanced querying, data analysis, and database design. Learn how to work with real datasets and become job-ready for data roles through live, mentor-led training.",
    price: 199.00,
    priceINR: 16999,
    priceUSD: 199,
    image: "/courses/sql-bootcamp.png",
    heroImage: "/courses/sql-hero.png",
    category: "Data Engineering",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Sales Data Analysis Dashboard",
        description: "Perform deep dive sales data analysis using aggregations and build a reporting dashboard.",
        icon: "trending_up"
      },
      {
        title: "Database Schema Design Project",
        description: "Design an optimized database schema for an ERP system and implement normalization.",
        icon: "database"
      },
      {
        title: "Business Insights Query System",
        description: "Develop complex queries to extract actionable business insights from raw data.",
        icon: "insights"
      },
      {
        title: "SQL-Based Interview Case Studies",
        description: "Solve 50+ real-world SQL interview problems and case studies.",
        icon: "verified"
      }
    ],
    tools: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "SQL (Advanced Queries)", icon: "sql" },
      { name: "Data Analysis", icon: "analytics" },
      { name: "GitHub", icon: "github" }
    ],
    requirements: [
      "No prior coding experience required.",
      "Beginners interested in data and analytics",
      "Working professionals transitioning into data roles",
      "Students aiming for data analyst or data engineering careers"
    ],
    curriculum: [
      {
        id: "01",
        title: "SQL Foundations",
        meta: "Week 1",
        lessons: [
          { title: "SELECT, WHERE & Filtering", type: "video" },
          { title: "Sorting & Query Patterns", type: "live" }
        ],
        practice: "Basic data retrieval exercises",
        outcome: "Write clean SQL queries confidently.",
        isOpen: true
      },
      {
        id: "02",
        title: "Aggregations & Analysis",
        meta: "Week 2",
        lessons: [
          { title: "GROUP BY, HAVING & Nulls", type: "live" },
          { title: "CASE WHEN for Reporting", type: "video" }
        ],
        practice: "Sales metrics analysis project",
        outcome: "Perform complex data aggregations."
      },
      {
        id: "03",
        title: "Joins Mastery",
        meta: "Week 3",
        lessons: [
          { title: "INNER, LEFT, RIGHT & FULL Joins", type: "video" },
          { title: "Multi-table query logic", type: "live" }
        ],
        practice: "Business multi-table query tasks",
        outcome: "Extract insights across diverse tables."
      },
      {
        id: "04",
        title: "Subqueries & Advanced Filtering",
        meta: "Week 4",
        lessons: [
          { title: "Exists, In, ANY/ALL", type: "live" },
          { title: "Nested Query Problems", type: "video" }
        ],
        practice: "Complex nested filtering tasks",
        outcome: "Solve intermediate SQL logic problems."
      },
      {
        id: "05",
        title: "Window Functions",
        meta: "Week 5",
        lessons: [
          { title: "Rank, RowNumber, Partition", type: "video" },
          { title: "Lag/Lead & Running Totals", type: "live" }
        ],
        practice: "Ranking and time-trend analysis",
        outcome: "Solve interview-level analytical SQL."
      },
      {
        id: "06",
        title: "Data Transformation",
        meta: "Week 6",
        lessons: [
          { title: "String & Date Functions", type: "live" },
          { title: "Cleaning Messy Datasets", type: "video" }
        ],
        practice: "Transform datasets for reporting",
        outcome: "Deliver clean, high-quality data reports."
      },
      {
        id: "07",
        title: "Database Design Basics",
        meta: "Week 7",
        lessons: [
          { title: "Normalization & Schema Design", type: "video" },
          { title: "Indexing & Performance", type: "live" }
        ],
        practice: "Designing database structures",
        outcome: "Understand data organization principles."
      },
      {
        id: "08",
        title: "Capstone & Interviews",
        meta: "Week 8",
        lessons: [
          { title: "End-to-End SQL Project", type: "live" },
          { title: "Mock SQL Interviews", type: "live" }
        ],
        practice: "Final real-world dataset project",
        outcome: "Complete portfolio-ready SQL project."
      }
    ],
    features: [
      "Focused on real-world data analysis and business use cases",
      "Live training with practical query-building sessions",
      "Designed for beginners and career switchers",
      "ISO-Certified Program"
    ]
  }
];

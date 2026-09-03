export const coursesData = [
  {
    slug: "ai-agents-engineering",
    status: "COMING_SOON",
    title: "AI Agents Engineering Bootcamp",
    subtitle: "8-Week Production AI Agents Journey",
    description:
      "Learn to build, orchestrate, and deploy autonomous AI agents. Move beyond simple chatbots to multi-agent systems and stateful AI workflows using LangGraph and LangChain.",
    price: 599.0,
    priceINR: 49999,
    priceUSD: 599,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779093255/vydhra/courses/y1hmvho2nzt4fzat4xjt.png",
    heroImage: "/courses/ai-agents-hero.png",
    category: "AI Engineering",
    level: "Intermediate",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Autonomous Research Agent",
        description:
          "Design an agent system for automated web research and reporting.",
        icon: "search",
      },
      {
        title: "Multi-Agent System",
        description: "Orchestrate multiple agents using CrewAI or AutoGen.",
        icon: "layers",
      },
      {
        title: "PDF Knowledge RAG",
        description:
          "Build a state-of-the-art RAG system with complex retrieval.",
        icon: "cpu",
      },
    ],
    tools: [
      { name: "OpenAI", icon: "openai" },
      { name: "LangChain", icon: "langchain" },
      { name: "Python", icon: "python" },
    ],
    requirements: [
      "Python programming proficiency",
      "Basic understanding of LLMs",
      "Willingness to build complex systems",
    ],
    curriculum: [
      {
        id: "01",
        title: "Foundations of AI Agents",
        meta: "Week 1",
        lessons: [
          {
            title:
              "AI agents vs LLM apps, real-world use cases, and agent architecture basics",
            type: "video",
          },
          {
            title:
              "Reason-act-observe loops, tools, APIs, and system design essentials",
            type: "live",
          },
        ],
        practice: "Build a basic AI assistant using an LLM API",
        outcome:
          "Students understand agent architecture and build a first working agent.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Prompt Engineering and Control",
        meta: "Week 2",
        lessons: [
          {
            title:
              "Chain-of-thought, ReAct, few-shot prompting, and system prompt design",
            type: "live",
          },
          {
            title:
              "Tool calling, structured outputs, prompt debugging, and optimization",
            type: "video",
          },
        ],
        practice: "Build a reasoning-based agent with tool usage",
        outcome:
          "Students control LLM behavior more reliably and intelligently.",
      },
      {
        id: "03",
        title: "LangChain and Tool-Based Agents",
        meta: "Week 3",
        lessons: [
          {
            title:
              "Chains, tools, memory, execution flow, and decision-making patterns",
            type: "video",
          },
          {
            title:
              "Multi-tool agents with search, calculator, and API integrations",
            type: "live",
          },
        ],
        practice: "Build a multi-tool agent",
        outcome: "Students build modular agents using tools and memory.",
      },
      {
        id: "04",
        title: "RAG Systems",
        meta: "Week 4",
        lessons: [
          {
            title:
              "Embeddings, vector databases, chunking strategies, and document retrieval",
            type: "live",
          },
          {
            title:
              "Retrieval optimization and hallucination-reduction techniques",
            type: "video",
          },
        ],
        practice: "Build a PDF knowledge chatbot",
        outcome:
          "Students create knowledge-based AI systems for real applications.",
      },
      {
        id: "05",
        title: "LangGraph Workflows",
        meta: "Week 5",
        lessons: [
          {
            title:
              "State machines, planner-executor flows, and looping agent workflows",
            type: "video",
          },
          {
            title:
              "Fallbacks, error handling, and structured multi-step design",
            type: "live",
          },
        ],
        practice: "Build a planner-executor agent system",
        outcome: "Students design reliable multi-step AI workflows.",
      },
      {
        id: "06",
        title: "Multi-Agent Systems",
        meta: "Week 6",
        lessons: [
          {
            title:
              "AutoGen, CrewAI, collaboration patterns, and agent communication",
            type: "live",
          },
          {
            title:
              "Task delegation, role-based agents, and system scaling concepts",
            type: "video",
          },
        ],
        practice: "Build a research-plus-writer multi-agent system",
        outcome:
          "Students build collaborative AI systems with multiple agents.",
      },
      {
        id: "07",
        title: "Production AI Systems",
        meta: "Week 7",
        lessons: [
          {
            title:
              "Deployment with Streamlit/FastAPI, logging, monitoring, and observability",
            type: "video",
          },
          {
            title:
              "Cost optimization, retries, guardrails, and safety handling",
            type: "live",
          },
        ],
        practice: "Deploy an AI agent web app with logging",
        outcome: "Students build production-ready AI applications.",
      },
      {
        id: "08",
        title: "Evaluation and Capstone",
        meta: "Week 8",
        lessons: [
          {
            title:
              "Evaluation, debugging, tracing, benchmarking, and optimization workflows",
            type: "live",
          },
          {
            title:
              "Final capstone: full AI agent system with deployment and testing",
            type: "live",
          },
        ],
        practice: "Build a final portfolio project",
        outcome: "Students complete a portfolio-ready AI system.",
      },
    ],
    features: [
      "Design and deploy autonomous AI agents using LangChain & RAG",
      "Multi-agent orchestration with CrewAI or AutoGen",
      "Production-level AI system design",
      "ISO-Certified Program",
    ],
  },
  {
    slug: "mern-stack-ai",
    status: "LIVE",
    title: "MERN + AI Job-Ready Bootcamp",
    subtitle: "Become a Full-Stack Developer with AI Skills",
    description:
      "Master full-stack development using MongoDB, Express, React, and Node.js—enhanced with AI tools, APIs, and modern workflows. Build production-ready applications and become job-ready in 3–6 months.",
    price: 399.0,
    priceINR: 34999,
    priceUSD: 399,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779092264/vydhra/courses/terswehvclb4i81e88x9.png",
    heroImage: "/courses/mern-hero.png",
    category: "Fullstack Development",
    level: "Professional",
    duration: "12 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Full-Stack Dashboard Application",
        description: "Build a responsive dashboard with full CRUD and Auth.",
        icon: "layout",
      },
      {
        title: "AI Chatbot Integration Project",
        description: "Integrate a custom AI chatbot using OpenAI API.",
        icon: "bot",
      },
      {
        title: "Production-Level Portfolio Website",
        description: "Deploy a fleet of production-ready fullstack apps.",
        icon: "verified",
      },
      {
        title: "End-to-End MERN + AI Application",
        description:
          "Develop a complete application from scratch with integrated AI features.",
        icon: "auto_awesome",
      },
    ],
    tools: [
      { name: "MongoDB", icon: "mongodb" },
      { name: "Express.js", icon: "express" },
      { name: "React.js", icon: "react" },
      { name: "Node.js", icon: "node" },
      { name: "APIs & AI Tools", icon: "openai" },
      { name: "Git & Deployment", icon: "git" },
    ],
    requirements: [
      "Basic knowledge of JavaScript and web fundamentals is helpful but not mandatory.",
      "Beginners with basic programming understanding",
      "Developers looking to upgrade into full-stack + AI",
      "Career switchers entering software development",
    ],
    curriculum: [
      {
        id: "01",
        title: "Web Foundations",
        meta: "Week 1",
        lessons: [
          { title: "Semantic HTML & SEO Basics", type: "video" },
          { title: "Flexbox & Tailwind CSS", type: "live" },
        ],
        practice: "Build a responsive landing page with AI",
        outcome: "Can build mobile-first layouts using Tailwind.",
      },
      {
        id: "02",
        title: "JavaScript Mastery",
        meta: "Week 2",
        lessons: [
          { title: "ES6+ Essentials & Async JS", type: "live" },
          { title: "Handling APIs & Fetch", type: "video" },
        ],
        practice: "Build an API-based mini app",
        outcome: "Can handle asynchronous operations comfortably.",
      },
      {
        id: "03",
        title: "React Core",
        meta: "Week 3",
        lessons: [
          { title: "JSX, Components & Props", type: "video" },
          { title: "State Management & useEffect", type: "live" },
        ],
        practice: "Build a multi-page interactive React app",
        outcome: "Can create dynamic SPAs with React hooks.",
      },
      {
        id: "04",
        title: "Advanced React & State",
        meta: "Week 4",
        lessons: [
          { title: "Context API & Global State", type: "live" },
          { title: "Auth Flow & Protected Routes", type: "video" },
        ],
        practice: "Implement secure authentication flow",
        outcome: "Can manage global state and secure routes.",
      },
      {
        id: "05",
        title: "Frontend Production",
        meta: "Week 5",
        lessons: [
          { title: "Project Setup & CRUD Integration", type: "live" },
          { title: "UX Principles & Polish with AI", type: "video" },
        ],
        practice: "Finalize production dashboard frontend",
        outcome: "Complete a professional-grade frontend system.",
      },
      {
        id: "06",
        title: "Node.js & Express",
        meta: "Week 6",
        lessons: [
          { title: "Server Setup & Middleware", type: "video" },
          { title: "REST API Design Principles", type: "live" },
        ],
        practice: "Build a scalable backend REST API",
        outcome: "Can build modular server-side applications.",
      },
      {
        id: "07",
        title: "Databases & Prisma",
        meta: "Week 7",
        lessons: [
          { title: "MongoDB/SQL Schema Design", type: "live" },
          { title: "Relational CRUD & ORM", type: "video" },
        ],
        practice: "Design relational database schemas",
        outcome: "Can model data and optimize storage.",
      },
      {
        id: "08",
        title: "Backend Security",
        meta: "Week 8",
        lessons: [
          { title: "JWT Auth & Password Hashing", type: "video" },
          { title: "RBAC & API Hardening", type: "live" },
        ],
        practice: "Implement a secure login system",
        outcome: "Can protect backend resources effectively.",
      },
      {
        id: "09",
        title: "AI Tools & Workflows",
        meta: "Week 9",
        lessons: [
          { title: "Prompt Engineering & Code Gen", type: "live" },
          { title: "AI-Driven Testing & Docs", type: "video" },
        ],
        practice: "Automate tests and docs with AI",
        outcome: "Adopt AI-first development workflows.",
      },
      {
        id: "10",
        title: "AI Integration",
        meta: "Week 10",
        lessons: [
          { title: "OpenAI API & Chatbots", type: "video" },
          { title: "AI Blog & Content Generators", type: "live" },
        ],
        practice: "Integrate custom AI features into app",
        outcome: "Can leverage LLMs for intelligent features.",
      },
      {
        id: "11",
        title: "Deployment & CI/CD",
        meta: "Week 11",
        lessons: [
          { title: "Vercel & Environment Config", type: "live" },
          { title: "CI/CD Pipelines & Performance", type: "video" },
        ],
        practice: "Deploy fullstack system with CI/CD",
        outcome: "Understand software release lifecycle.",
      },
      {
        id: "12",
        title: "Capstone & Portfolio",
        meta: "Week 12",
        lessons: [
          { title: "Capstone Finalization", type: "live" },
          { title: "Resume & Interview Prep", type: "live" },
        ],
        practice: "Complete portfolio-ready fullstack AI app",
        outcome: "Job-ready with a major live project.",
      },
    ],
    features: [
      "Combines full-stack development with real AI integration",
      "Built for real-world production environments",
      "Live mentorship from industry professionals",
      "ISO-Certified Program",
    ],
  },
  {
    slug: "ml-job-ready",
    status: "COMING_SOON",
    title: "ML Job Ready Bootcamp",
    subtitle: "Become Job-Ready in 3–6 Months",
    description:
      "Master machine learning and AI systems through live, mentor-led training. Build real-world projects, deploy models, and develop job-ready skills that companies actively look for.",
    price: 499.0,
    priceINR: 42999,
    priceUSD: 499,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779091939/vydhra/courses/bt3mmjtr4oczgrpbclsk.png",
    heroImage: "/courses/ml-hero.png",
    category: "AI & ML",
    level: "Professional",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Predictive Analytics System",
        description:
          "Build a regression model to predict future sales trends and business outcomes.",
        icon: "trending_up",
      },
      {
        title: "Customer Segmentation Model",
        description:
          "Use clustering to group customers based on behavior for targeted marketing.",
        icon: "groups",
      },
      {
        title: "Image Classification Project",
        description:
          "Develop a deep learning model for visual recognition and object detection.",
        icon: "camera_alt",
      },
      {
        title: "End-to-End ML Deployment Project",
        description:
          "Deploy a complete machine learning model into a production environment.",
        icon: "cloud_upload",
      },
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "Scikit-Learn", icon: "scikit-learn" },
      { name: "TensorFlow", icon: "tensorflow" },
      { name: "PyTorch", icon: "pytorch" },
      { name: "Pandas & NumPy", icon: "pandas" },
    ],
    requirements: [
      "No prior experience required—just consistency and commitment.",
      "Beginners with no coding background",
      "Working professionals switching to tech",
      "Graduates aiming for AI/ML careers",
    ],
    curriculum: [
      {
        id: "01",
        title: "Intro to Machine Learning & Statistics",
        meta: "Week 1",
        lessons: [
          {
            title: "What is ML? Types and Real-world applications",
            type: "video",
          },
          {
            title: "Descriptive Statistics: Mean, Median, Mode, Std Dev",
            type: "live",
          },
          {
            title: "Probability Basics & Inferential Statistics",
            type: "video",
          },
        ],
        practice: "Exploratory Data Analysis (EDA) on a basic dataset",
        outcome:
          "Students understand ML terminology and the mathematical backbone of data analysis.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Python for Data Science",
        meta: "Week 2",
        lessons: [
          { title: "NumPy for numerical operations", type: "live" },
          {
            title: "Pandas for data manipulation & Series/DataFrames",
            type: "video",
          },
          {
            title: "Matplotlib & Seaborn for data visualization",
            type: "live",
          },
        ],
        practice: "Automating data summary reports using Pandas",
        outcome:
          "Students can load, manipulate, and visualize datasets efficiently using Python.",
      },
      {
        id: "03",
        title: "Data Preprocessing & Cleaning",
        meta: "Week 3",
        lessons: [
          { title: "Handling missing values & outliers", type: "video" },
          {
            title: "Feature scaling (Standardization/Normalization)",
            type: "live",
          },
          { title: "Encoding categorical variables", type: "video" },
        ],
        practice: "Preparing a 'dirty' dataset for machine learning models",
        outcome:
          "Students gain the ability to turn raw, messy data into high-quality training features.",
      },
      {
        id: "04",
        title: "Supervised Learning (Regression)",
        meta: "Week 4",
        lessons: [
          {
            title: "Linear Regression & Multi-Linear Regression",
            type: "live",
          },
          {
            title: "Cost functions, Gradient Descent, & MSE/R2-score",
            type: "video",
          },
          { title: "Regularization (Lasso/Ridge regression)", type: "live" },
        ],
        practice: "House price prediction project",
        outcome:
          "Students can build predictive models for continuous values and evaluate performance.",
      },
      {
        id: "05",
        title: "Supervised Learning (Classification)",
        meta: "Week 5",
        lessons: [
          { title: "Logistic Regression & Decision Trees", type: "video" },
          {
            title: "Random Forest & Support Vector Machines (SVM)",
            type: "live",
          },
          {
            title: "Confusion matrix, Precision, Recall, & F1-score",
            type: "video",
          },
        ],
        practice: "Spam detection or Loan approval project",
        outcome:
          "Students can build robust classification models and interpret evaluation metrics.",
      },
      {
        id: "06",
        title: "Unsupervised Learning",
        meta: "Week 6",
        lessons: [
          { title: "Clustering (K-Means & Hierarchical)", type: "live" },
          { title: "Dimensionality Reduction (PCA basics)", type: "video" },
          { title: "Association Rule Learning", type: "live" },
        ],
        practice: "Customer segmentation project",
        outcome:
          "Students can identify patterns and group data in practical scenarios.",
      },
      {
        id: "07",
        title: "Deep Learning Fundamentals",
        meta: "Week 7",
        lessons: [
          {
            title: "Neural networks, layers, and activation functions",
            type: "video",
          },
          { title: "TensorFlow/Keras introduction", type: "live" },
          {
            title: "When to use Deep Learning vs Traditional ML",
            type: "video",
          },
        ],
        practice: "Basic image classification demonstration",
        outcome:
          "Students gain a strong beginner-level understanding of deep learning concepts and tools.",
      },
      {
        id: "08",
        title: "Capstone & Job Readiness",
        meta: "Week 8",
        lessons: [
          { title: "End-to-end ML project workflow", type: "live" },
          { title: "Model evaluation & deployment basics", type: "video" },
          { title: "GitHub portfolio polish & Interview prep", type: "live" },
        ],
        outcome:
          "Students complete a portfolio-ready ML project and strengthen job readiness.",
        isOpen: true,
      },
    ],
    features: [
      "Live instructor-led sessions (no pre-recorded content)",
      "Real-world projects via Ramesys",
      "Resume + Interview Preparation",
      "ISO-Certified Program",
    ],
  },
  {
    slug: "python-ai",
    status: "LIVE",
    title: "Python AI Course",
    subtitle: "From Beginner to Job-Ready in 3–6 Months",
    description:
      "Learn Python, AI, and real-world application development through live, mentor-led training. Build projects using modern tools, APIs, and LLMs to become job-ready in today’s AI-driven tech industry.",
    price: 299.0,
    priceINR: 24999,
    priceUSD: 299,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779091340/vydhra/courses/mtz046uw3cza7x2la73o.png",
    heroImage: "/courses/python-hero.png",
    category: "Programming",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Command-Line Automation Tool",
        description:
          "Understand core Python concepts by building a working automation script.",
        icon: "calculate",
      },
      {
        title: "Interactive Logic-Based Game",
        description:
          "Apply conditions and loops to create an interactive number-based game.",
        icon: "sports_esports",
      },
      {
        title: "Task Manager with File Handling",
        description:
          "Build a simple command-line tool to manage daily tasks and understand file I/O.",
        icon: "assignment",
      },
      {
        title: "API-Based AI Application",
        description:
          "Integrate external APIs and LLMs to build an intelligent application.",
        icon: "auto_awesome",
      },
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "APIs & Automation", icon: "api" },
      { name: "Git & GitHub", icon: "git" },
      { name: "SQL Basics", icon: "database" },
      { name: "AI Workflows", icon: "psychology" },
    ],
    requirements: [
      "No prior experience required—just consistency and willingness to learn.",
      "Complete beginners with no coding experience",
      "Working professionals switching to tech",
      "Students aiming for AI or development careers",
    ],
    curriculum: [
      {
        id: "01",
        title: "Python Foundations",
        meta: "Week 1",
        lessons: [
          {
            title: "Intro to Python: Installation and Hello World",
            type: "video",
          },
          { title: "Variables, Data Types, and Type Casting", type: "live" },
          {
            title: "Basic Operators: Arithmetic, Comparison & Logical",
            type: "video",
          },
        ],
        practice: "Building a basic BMI or Currency Converter calculator",
        outcome:
          "Students can write simple scripts and understand how computers store information.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Control Flow & Data Structures",
        meta: "Week 2",
        lessons: [
          {
            title: "Conditional Statements (If-Else, Match-Case)",
            type: "live",
          },
          { title: "Loops: For & While loops with range", type: "video" },
          { title: "List, Tuple, Set & Dictionary essentials", type: "live" },
        ],
        practice: "Creating a mini To-Do List or Grocery List app",
        outcome:
          "Students can implement logic and manage collections of data efficiently.",
      },
      {
        id: "03",
        title: "Functions & Logic Building",
        meta: "Week 3",
        lessons: [
          {
            title: "Defining functions, parameters, and return values",
            type: "video",
          },
          { title: "Lambda functions & recursion basics", type: "live" },
          { title: "Scope, local vs global variables", type: "video" },
        ],
        practice: "Building a functional 'Rock, Paper, Scissors' game",
        outcome:
          "Students can write reusable, modular code and break down complex problems.",
      },
      {
        id: "04",
        title: "File Handling & Error Handling",
        meta: "Week 4",
        lessons: [
          { title: "Reading/Writing text and CSV files", type: "live" },
          { title: "With-statement context managers", type: "video" },
          { title: "Try-Except blocks and debugging basics", type: "live" },
        ],
        practice: "Building a password manager that saves to a file",
        outcome:
          "Students can work with external data and build error-resistant programs.",
      },
      {
        id: "05",
        title: "Advanced Python & Algorithms",
        meta: "Week 5",
        lessons: [
          { title: "List comprehensions and generators", type: "video" },
          { title: "Built-in modules: Math, Random, Datetime", type: "live" },
          {
            title: "Intro to basic sorting and searching algorithms",
            type: "video",
          },
        ],
        practice: "Solving logic puzzles using advanced Python features",
        outcome:
          "Students can write highly optimized and performance-oriented code.",
      },
      {
        id: "06",
        title: "OOPs & Git Version Control",
        meta: "Week 6",
        lessons: [
          { title: "Classes, Objects, and __init__ method", type: "live" },
          {
            title: "Git basics: GitHub repos, commits, push workflow",
            type: "video",
          },
          { title: "Inheritance and portfolio hygiene", type: "live" },
        ],
        practice: "Student record class and publishing to GitHub",
        outcome:
          "Students can build class-based programs and publish work professionally.",
      },
      {
        id: "07",
        title: "APIs, SQL & AI Basics",
        meta: "Week 7",
        lessons: [
          { title: "API basics with requests & JSON", type: "video" },
          { title: "SQL basics & data querying", type: "live" },
          { title: "Prompt Engineering & intro to LLM APIs", type: "video" },
        ],
        practice: "Weather app and prompt design practice",
        outcome:
          "Students gain exposure to data querying, APIs, and AI workflow concepts.",
      },
      {
        id: "08",
        title: "Capstone & Job Readiness",
        meta: "Week 8",
        lessons: [
          { title: "Capstone planning and development", type: "live" },
          { title: "Testing, debugging, and cleanup", type: "video" },
          { title: "Resume, LinkedIn & GitHub polish", type: "live" },
        ],
        practice: "Final capstone, README, and mock interview",
        outcome:
          "Students finish with a portfolio-ready project and fresher job readiness.",
        isOpen: true,
      },
    ],
    features: [
      "Designed for beginners and career switchers",
      "Focus on real-world application, not just theory",
      "Learn AI tools, APIs, and automation workflows",
      "ISO-Certified Program",
    ],
  },
  {
    slug: "sql-job-ready",
    status: "COMING_SOON",
    title: "SQL Job-Ready Bootcamp",
    subtitle: "Become Job-Ready in Data & Analytics in 6 Weeks",
    description:
      "Master SQL from fundamentals to advanced querying, data analysis, and database design. Learn how to work with real datasets and become job-ready for data roles through live, mentor-led training.",
    price: 199.0,
    priceINR: 16999,
    priceUSD: 199,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779091652/vydhra/courses/zd8vgqqzm9altdpn2ggo.png",
    heroImage: "/courses/sql-hero.png",
    category: "Data Engineering",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Sales Data Analysis Dashboard",
        description:
          "Perform deep dive sales data analysis using aggregations and build a reporting dashboard.",
        icon: "trending_up",
      },
      {
        title: "Database Schema Design Project",
        description:
          "Design an optimized database schema for an ERP system and implement normalization.",
        icon: "database",
      },
      {
        title: "Business Insights Query System",
        description:
          "Develop complex queries to extract actionable business insights from raw data.",
        icon: "insights",
      },
      {
        title: "SQL-Based Interview Case Studies",
        description:
          "Solve 50+ real-world SQL interview problems and case studies.",
        icon: "verified",
      },
    ],
    tools: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "SQL (Advanced Queries)", icon: "sql" },
      { name: "Data Analysis", icon: "analytics" },
      { name: "GitHub", icon: "github" },
    ],
    requirements: [
      "No prior coding experience required.",
      "Beginners interested in data and analytics",
      "Working professionals transitioning into data roles",
      "Students aiming for data analyst or data engineering careers",
    ],
    curriculum: [
      {
        id: "01",
        title: "SQL Foundations",
        meta: "Week 1",
        lessons: [
          { title: "SELECT, WHERE & Filtering", type: "video" },
          { title: "Sorting & Query Patterns", type: "live" },
        ],
        practice: "Basic data retrieval exercises",
        outcome: "Write clean SQL queries confidently.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Aggregations & Analysis",
        meta: "Week 2",
        lessons: [
          { title: "GROUP BY, HAVING & Nulls", type: "live" },
          { title: "CASE WHEN for Reporting", type: "video" },
        ],
        practice: "Sales metrics analysis project",
        outcome: "Perform complex data aggregations.",
      },
      {
        id: "03",
        title: "Joins Mastery",
        meta: "Week 3",
        lessons: [
          { title: "INNER, LEFT, RIGHT & FULL Joins", type: "video" },
          { title: "Multi-table query logic", type: "live" },
        ],
        practice: "Business multi-table query tasks",
        outcome: "Extract insights across diverse tables.",
      },
      {
        id: "04",
        title: "Subqueries & Advanced Filtering",
        meta: "Week 4",
        lessons: [
          { title: "Exists, In, ANY/ALL", type: "live" },
          { title: "Nested Query Problems", type: "video" },
        ],
        practice: "Complex nested filtering tasks",
        outcome: "Solve intermediate SQL logic problems.",
      },
      {
        id: "05",
        title: "Window Functions",
        meta: "Week 5",
        lessons: [
          { title: "Rank, RowNumber, Partition", type: "video" },
          { title: "Lag/Lead & Running Totals", type: "live" },
        ],
        practice: "Ranking and time-trend analysis",
        outcome: "Solve interview-level analytical SQL.",
      },
      {
        id: "06",
        title: "Data Transformation",
        meta: "Week 6",
        lessons: [
          { title: "String & Date Functions", type: "live" },
          { title: "Cleaning Messy Datasets", type: "video" },
        ],
        practice: "Transform datasets for reporting",
        outcome: "Deliver clean, high-quality data reports.",
      },
      {
        id: "07",
        title: "Database Design Basics",
        meta: "Week 7",
        lessons: [
          { title: "Normalization & Schema Design", type: "video" },
          { title: "Indexing & Performance", type: "live" },
        ],
        practice: "Designing database structures",
        outcome: "Understand data organization principles.",
      },
      {
        id: "08",
        title: "Capstone & Interviews",
        meta: "Week 8",
        lessons: [
          { title: "End-to-End SQL Project", type: "live" },
          { title: "Mock SQL Interviews", type: "live" },
        ],
        practice: "Final real-world dataset project",
        outcome: "Complete portfolio-ready SQL project.",
      },
    ],
    features: [
      "Focused on real-world data analysis and business use cases",
      "Live training with practical query-building sessions",
      "Designed for beginners and career switchers",
      "ISO-Certified Program",
    ],
  },
  {
    slug: "power-bi-analytics",
    status: "COMING_SOON",
    title: "Power BI Data Analytics Job-Ready Bootcamp",
    subtitle: "Master Power BI from Data Cleaning to Executive Dashboards",
    description:
      "Master Power BI from data cleaning to executive dashboards. Build real business projects, track KPIs, and become job-ready with portfolio + interview prep.",
    price: 199.0,
    priceINR: 16999,
    priceUSD: 199,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104633/power-bi-light_dfobvq.png",
    heroImage: "/courses/power-bi-hero.png",
    category: "Data Analytics",
    level: "Beginner to Advanced",
    duration: "4 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Sales Performance Dashboard",
        description:
          "Track revenue, growth, and KPIs with interactive visuals.",
        icon: "trending_up",
      },
      {
        title: "Business KPI Dashboard",
        description:
          "Build executive-level dashboards with filters & drilldowns.",
        icon: "insights",
      },
      {
        title: "Data Cleaning Project",
        description:
          "Transform messy datasets into analysis-ready format with Power Query.",
        icon: "cleaning_services",
      },
      {
        title: "Final Portfolio Dashboard",
        description:
          "End-to-end BI project (data → model → dashboard → presentation).",
        icon: "verified",
      },
    ],
    tools: [
      { name: "Power BI Desktop", icon: "powerbi" },
      { name: "Power Query", icon: "powerquery" },
      { name: "DAX", icon: "dax" },
      { name: "Data Modeling", icon: "datamodeling" },
      { name: "Power BI Service", icon: "cloud" },
    ],
    requirements: [
      "Basic understanding of data (Excel is enough)",
      "No coding required",
      "Willingness to practice dashboards",
    ],
    curriculum: [
      {
        id: "01",
        title: "Data Cleaning & Power Query",
        meta: "Week 1",
        lessons: [
          { title: "Introduction to Power BI & ETL Processes", type: "live" },
          {
            title: "Transforming Messy Datasets in Power Query Editor",
            type: "video",
          },
        ],
        practice:
          "Clean eCommerce/Sales raw dataset and prepare it for loading",
        outcome:
          "Can clean, format, and load unstructured raw datasets with ease.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Data Modeling & Star Schema",
        meta: "Week 2",
        lessons: [
          {
            title:
              "Understanding Relationships, Star Schema & Snowflake Schema",
            type: "live",
          },
          {
            title:
              "Creating Active vs Inactive Relationships & Cross Filtering",
            type: "video",
          },
        ],
        practice: "Design an optimized database schema for Business KPIs",
        outcome:
          "Students design efficient schemas and create reliable data models.",
      },
      {
        id: "03",
        title: "DAX (Data Analysis Expressions)",
        meta: "Week 3",
        lessons: [
          {
            title: "Calculated Columns vs Measures & Basic DAX Functions",
            type: "live",
          },
          {
            title: "Time Intelligence Functions & CALCULATE Deep-Dive",
            type: "video",
          },
        ],
        practice: "Implement KPI calculations, YTD/MTD and growth metrics",
        outcome: "Students construct advanced business logic and KPI formulas.",
      },
      {
        id: "04",
        title: "Dashboard Design & Service Deployment",
        meta: "Week 4",
        lessons: [
          {
            title: "Visual Storytelling, Layout Design & Interactive Elements",
            type: "live",
          },
          {
            title: "Power BI Service: Publishing, Gateway Setup & RLS",
            type: "video",
          },
        ],
        practice:
          "Build and publish an executive-level sales performance dashboard",
        outcome:
          "Students deploy interactive dashboards and create professional portfolio reports.",
      },
    ],
    features: [
      "Build real business dashboards (Sales, Finance, Marketing)",
      "Learn Power Query + DAX used in actual companies",
      "Focus on job-ready skills, not just theory",
      "Includes portfolio project + interview prep",
      "Designed for analyst roles (BI / Data Analyst)",
    ],
  },
  {
    slug: "python-data-analysis",
    status: "COMING_SOON",
    title: "Data Analysis with Python Bootcamp",
    subtitle:
      "Become a Data Analyst with Python, Pandas & Real Business Projects",
    description:
      "Learn how to clean, analyze, and visualize data using Python. Build real-world projects and become job-ready for data analyst roles.",
    price: 299.0,
    priceINR: 24999,
    priceUSD: 299,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104633/data-analysis-with-python_k3oqpu.png",
    heroImage: "/courses/python-analysis-hero.png",
    category: "Data Analytics",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Sales Data Analysis Project",
        description: "Clean and analyze structured business data.",
        icon: "analytics",
      },
      {
        title: "eCommerce Data Cleaning Project",
        description: "Handle real-world messy datasets and clean outliers.",
        icon: "cleaning_services",
      },
      {
        title: "Exploratory Data Analysis (EDA) Project",
        description:
          "Find trends, patterns, and insights in user behavior data.",
        icon: "search",
      },
      {
        title: "Final Portfolio Data Analysis Project",
        description:
          "End-to-end analysis (clean → analyze → visualize → report).",
        icon: "verified",
      },
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "Pandas & NumPy", icon: "pandas" },
      { name: "Matplotlib & Seaborn", icon: "matplotlib" },
      { name: "Jupyter Notebook", icon: "jupyter" },
      { name: "Basic Statistics", icon: "statistics" },
    ],
    requirements: [
      "Basic computer knowledge",
      "No coding experience required",
      "Willingness to practice datasets",
    ],
    curriculum: [
      {
        id: "01",
        title: "Python Foundations & Data Cleaning",
        meta: "Weeks 1-2",
        lessons: [
          {
            title: "Python Basics for Data Analysis: Variables & Lists",
            type: "live",
          },
          {
            title: "Pandas Intro: Series, DataFrames & Reading CSV/Excel",
            type: "video",
          },
          {
            title: "Handling Missing Values, Duplicates & Filtering",
            type: "live",
          },
        ],
        practice: "Clean eCommerce dataset containing messy user entries",
        outcome:
          "Can write python code and clean unstructured real-world datasets.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Analysis & Visualization",
        meta: "Weeks 3-5",
        lessons: [
          {
            title: "Groupby operations, Aggregations & Pivot tables",
            type: "live",
          },
          {
            title:
              "Data Visualization with Matplotlib & Seaborn: Line, Bar & Scatter charts",
            type: "video",
          },
          {
            title: "Deriving Business KPIs and Insights from Clean Datasets",
            type: "live",
          },
        ],
        practice:
          "Generate a business insights report for sales and marketing teams",
        outcome:
          "Students visualize data patterns and deliver insightful business summaries.",
      },
      {
        id: "03",
        title: "Statistics & Capstone",
        meta: "Weeks 6-8",
        lessons: [
          {
            title: "Probability, Distributions & A/B Testing Basics",
            type: "live",
          },
          {
            title: "End-to-End Capstone Project Development & Presentation",
            type: "live",
          },
          {
            title: "Data Analyst Portfolio Polish & Mock Interviews",
            type: "video",
          },
        ],
        practice:
          "Build an end-to-end data analysis pipeline from raw data to final report",
        outcome:
          "Graduates build portfolio projects and crack data analyst interviews.",
      },
    ],
    features: [
      "Learn Pandas, EDA, Visualization, Statistics end-to-end",
      "Work on real datasets (sales, eCommerce, marketing)",
      "Focus on business insights, not just coding",
      "Includes portfolio project + interview prep",
      "Designed for Data Analyst roles",
    ],
  },
  {
    slug: "r-data-analysis",
    status: "COMING_SOON",
    title: "Data Analysis with R Bootcamp",
    subtitle: "Become a Data Analyst using R, Tidyverse & Business Reporting",
    description:
      "Master R for data cleaning, analysis, visualization, and reporting. Build portfolio projects and become job-ready for analyst roles.",
    price: 249.0,
    priceINR: 19999,
    priceUSD: 249,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104633/data-analysis-with-R_thxrcp.png",
    heroImage: "/courses/r-analysis-hero.png",
    category: "Data Analytics",
    level: "Beginner",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Data Cleaning Project with dplyr",
        description: "Transform messy real-world datasets and format columns.",
        icon: "cleaning_services",
      },
      {
        title: "Business Metrics Analysis Project",
        description: "Generate KPIs, summarize data, and discover insights.",
        icon: "analytics",
      },
      {
        title: "Visualization Project using ggplot2",
        description:
          "Create professional charts, heatmaps, and customizable reports.",
        icon: "insert_chart",
      },
      {
        title: "Final Portfolio Project",
        description: "End-to-end R analysis report with markdown publishing.",
        icon: "verified",
      },
    ],
    tools: [
      { name: "R & RStudio", icon: "r" },
      { name: "dplyr (Data Manipulation)", icon: "dplyr" },
      { name: "ggplot2 (Visualization)", icon: "ggplot2" },
      { name: "tidyverse", icon: "tidyverse" },
      { name: "R Markdown (Reporting)", icon: "rmarkdown" },
    ],
    requirements: [
      "Basic understanding of data",
      "No programming experience required",
      "Interest in analytics",
    ],
    curriculum: [
      {
        id: "01",
        title: "R Foundations & Data Cleaning",
        meta: "Weeks 1-3",
        lessons: [
          {
            title: "R Basics: Vectors, Matrices, Factors & DataFrames",
            type: "live",
          },
          {
            title: "dplyr verbs: filter, select, mutate, arrange & summarize",
            type: "video",
          },
        ],
        practice: "Clean a messy retail sales dataset with dplyr",
        outcome:
          "Manipulate datasets quickly and create clean data pipelines in R.",
        isOpen: true,
      },
      {
        id: "02",
        title: "tidyverse & ggplot2 Visualization",
        meta: "Weeks 4-6",
        lessons: [
          {
            title: "Reshaping Data with tidyr (pivot_longer, pivot_wider)",
            type: "live",
          },
          {
            title: "Grammar of Graphics: ggplot2 geometries, scales, & themes",
            type: "video",
          },
        ],
        practice: "Create publication-ready charts representing marketing KPIs",
        outcome:
          "Build professional visualizations and custom data plots in R.",
      },
      {
        id: "03",
        title: "R Markdown & Automated Reporting",
        meta: "Weeks 7-8",
        lessons: [
          {
            title: "Literate Programming: Dynamic documents with R Markdown",
            type: "live",
          },
          {
            title: "Structuring Analyst Reports, Slide Decks & Portfolio Prep",
            type: "video",
          },
        ],
        practice: "Publish a comprehensive HTML/PDF business analysis report",
        outcome:
          "Automate analytical reporting and prepare a job-ready R project portfolio.",
      },
    ],
    features: [
      "Learn R + dplyr + ggplot2 + reporting workflows",
      "Work on real-world datasets and case studies",
      "Strong focus on analytics + storytelling",
      "Includes portfolio + interview prep",
      "Designed for Data Analyst roles",
    ],
  },
  {
    slug: "ai-prompt-engineering",
    status: "LIVE",
    title: "AI Prompt Engineering Bootcamp",
    subtitle: "Become Job-Ready in AI Prompt Engineering in 4 Weeks",
    description:
      "Master AI tools, prompt systems, and real-world workflows to boost productivity, automate tasks, and unlock high-income opportunities.",
    price: 149.0,
    priceINR: 12999,
    priceUSD: 149,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104633/ai-prompt-eng-light_ikj7gf.png",
    heroImage: "/courses/prompt-eng-hero.png",
    category: "AI Engineering",
    level: "All Levels",
    duration: "4 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "AI Content Generation System",
        description:
          "Build a complete content generation and social media post system.",
        icon: "post_add",
      },
      {
        title: "Marketing Automation Workflow",
        description: "Create multi-step prompt chains for marketing funnels.",
        icon: "insights",
      },
      {
        title: "Business Prompt Library",
        description:
          "Build a robust prompt database/library for corporate workflows.",
        icon: "folder",
      },
      {
        title: "AI Productivity Portfolio",
        description:
          "Create an end-to-end portfolio showing automated real-world workflows.",
        icon: "verified",
      },
    ],
    tools: [
      { name: "ChatGPT & Claude", icon: "openai" },
      { name: "Prompt Systems", icon: "psychology" },
      { name: "AI Automation", icon: "auto_awesome" },
      { name: "Workflow Builders", icon: "build" },
      { name: "Freelance Platforms", icon: "work" },
    ],
    requirements: [
      "No coding experience required",
      "Access to internet & modern AI tools (Free tiers suffice)",
      "Willingness to practice and build workflows",
    ],
    curriculum: [
      {
        id: "01",
        title: "Prompt Engineering Foundations",
        meta: "Week 1",
        lessons: [
          {
            title: "How Modern LLMs work & Structured Prompt Writing",
            type: "live",
          },
          {
            title: "Zero-shot, Few-shot & Role-based Prompting Techniques",
            type: "video",
          },
        ],
        practice:
          "Create custom prompt templates for specific real-world tasks",
        outcome:
          "Write precise prompts that produce accurate, structured and usable results.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Business & Content Workflows",
        meta: "Week 2",
        lessons: [
          {
            title:
              "AI for Marketing copy, Competitor Analysis & Email Campaigns",
            type: "live",
          },
          {
            title:
              "Content generation workflows, brand voice guidelines & research helper",
            type: "video",
          },
        ],
        practice: "Build a custom automated AI content generation system",
        outcome:
          "Implement AI seamlessly inside marketing, content, and business operations.",
      },
      {
        id: "03",
        title: "Advanced Prompting & Automation",
        meta: "Week 3",
        lessons: [
          {
            title:
              "Prompt Chaining & generating structured outputs (JSON/Markdown)",
            type: "live",
          },
          {
            title:
              "AI integrations with Google Sheets, Docs & Zapier automations",
            type: "video",
          },
        ],
        practice:
          "Build a multi-step automated email responding workflow using prompt chains",
        outcome:
          "Automate manual administrative tasks saving hours of work daily.",
      },
      {
        id: "04",
        title: "AI Quality, Safety & Portfolio",
        meta: "Week 4",
        lessons: [
          {
            title: "Handling Hallucinations, Output verification & Guardrails",
            type: "live",
          },
          {
            title:
              "Freelancing strategies: Packaging Prompt Engineering services",
            type: "live",
          },
        ],
        practice: "Compile final prompt library and AI productivity portfolio",
        outcome:
          "Be job-ready as an AI productivity expert and successfully launch freelancing.",
      },
    ],
    features: [
      "Learn prompt systems and structured workflows, not random tricks",
      "100% project-based with weekly live building sessions",
      "Automate real-world tasks and increase efficiency drastically",
      "Includes freelance agency setup & interview training",
    ],
  },
  {
    slug: "html-css-js-front-end",
    status: "COMING_SOON",
    title: "HTML CSS & JS Job-Ready Bootcamp",
    subtitle: "Become a Job-Ready Front-End Developer in 12 Weeks",
    description:
      "Learn to build real websites, apps, and deploy live projects from scratch. Focus on responsive design, interactive JS, and production tools.",
    price: 249.0,
    priceINR: 19999,
    priceUSD: 249,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104633/html-css-js-light_k3ljas.png",
    heroImage: "/courses/frontend-hero.png",
    category: "Fullstack Development",
    level: "Beginner",
    duration: "12 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Portfolio Website",
        description: "Build your own responsive, modern portfolio site.",
        icon: "portrait",
      },
      {
        title: "Business Landing Page",
        description:
          "Create a highly converting, SEO friendly product landing page.",
        icon: "web",
      },
      {
        title: "API-Based Interactive App",
        description: "Develop a dynamic web app fetching live database info.",
        icon: "cloud",
      },
      {
        title: "Interactive Dashboard",
        description:
          "Build an executive admin-like dashboard using CSS grids and charts.",
        icon: "dashboard",
      },
    ],
    tools: [
      { name: "HTML5 & CSS3", icon: "html" },
      { name: "JavaScript (ES6+)", icon: "javascript" },
      { name: "Responsive Design", icon: "devices" },
      { name: "Git & GitHub", icon: "git" },
      { name: "Deployment & Vercel", icon: "cloud" },
    ],
    requirements: [
      "Basic computer literacy",
      "No programming experience required",
      "A laptop/PC with VS Code installed",
    ],
    curriculum: [
      {
        id: "01",
        title: "HTML, CSS & Responsive Layouts",
        meta: "Weeks 1-3",
        lessons: [
          {
            title: "Semantic HTML5 structure & SEO best practices",
            type: "live",
          },
          {
            title:
              "CSS Foundations: Flexbox, Grid, Custom Properties & Animations",
            type: "video",
          },
          {
            title: "Mobile-first responsive design & Media Queries",
            type: "live",
          },
        ],
        practice:
          "Develop and style a personal responsive portfolio landing page",
        outcome:
          "Can build structured, beautiful, and fully responsive static websites.",
        isOpen: true,
      },
      {
        id: "02",
        title: "JavaScript & DOM Manipulation",
        meta: "Weeks 4-6",
        lessons: [
          {
            title:
              "JS Basics: Variables, Arrays, Objects, Functions & Control Flow",
            type: "live",
          },
          {
            title:
              "DOM Selection, Event listeners, and Dynamic UI modifications",
            type: "video",
          },
          {
            title:
              "Fetching external APIs, Promises, Async/Await & JSON rendering",
            type: "live",
          },
        ],
        practice:
          "Build a real-time weather or movie search app fetching external data",
        outcome:
          "Implement logic, handle browser events, and pull API data into static pages.",
      },
      {
        id: "03",
        title: "Advanced Projects & Git Workflow",
        meta: "Weeks 7-10",
        lessons: [
          {
            title: "Version Control with Git & Hosting on GitHub",
            type: "live",
          },
          {
            title: "Modern build tools & deploying sites to Vercel/Netlify",
            type: "video",
          },
          {
            title:
              "Creating clean CSS themes, light/dark modes & UX improvements",
            type: "live",
          },
        ],
        practice:
          "Build and deploy a fully functional multi-page Business dashboard",
        outcome:
          "Deploy interactive applications live to production using git version control.",
      },
      {
        id: "04",
        title: "Capstone Project & Career Preparation",
        meta: "Weeks 11-12",
        lessons: [
          {
            title: "Designing and developing a custom Capstone application",
            type: "live",
          },
          {
            title:
              "Mock interviews, Resume review & Freelance job hunting templates",
            type: "live",
          },
        ],
        practice:
          "Complete your developer portfolio and apply for entry-level roles",
        outcome:
          "Become a job-ready Front-End Developer with a strong, published portfolio.",
      },
    ],
    features: [
      "Build 5+ real-world responsive frontend websites",
      "Learn DOM, APIs, and modern ES6+ JS by building things",
      "Get portfolio deployment and hosting training using Git",
      "Get career outcomes: Front-End Developer, Freelance Web Developer, UI Developer",
    ],
  },
  {
    slug: "data-engineering",
    status: "COMING_SOON",
    title: "Data Engineering Job-Ready Bootcamp",
    subtitle: "Master Data Pipelines, Snowflake, Airflow & Production Systems",
    description:
      "Master data pipelines, Snowflake, Airflow & real-world systems. Become a job-ready Data Engineer by building end-to-end pipelines.",
    price: 399.0,
    priceINR: 34999,
    priceUSD: 399,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104634/data-engineering-light_axpdwm.png",
    heroImage: "/courses/data-eng-hero.png",
    category: "Data Engineering",
    level: "Intermediate",
    duration: "12 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "API → Snowflake Pipeline",
        description:
          "Extract live weather/eCommerce data from API and load to Snowflake.",
        icon: "cloud",
      },
      {
        title: "Data Warehouse Design",
        description: "Build a complete Star Schema and OLAP structures.",
        icon: "database",
      },
      {
        title: "Automated Workflows",
        description:
          "Automate pipeline execution using Apache Airflow orchestrator.",
        icon: "schedule",
      },
      {
        title: "Capstone Pipeline",
        description:
          "End-to-end production data pipeline with testing and monitoring.",
        icon: "verified",
      },
    ],
    tools: [
      { name: "Python", icon: "python" },
      { name: "Snowflake", icon: "snowflake" },
      { name: "Apache Airflow", icon: "airflow" },
      { name: "SQL & dbt", icon: "sql" },
      { name: "API & Cloud Services", icon: "cloud" },
    ],
    requirements: [
      "Basic Python and intermediate SQL knowledge",
      "Willingness to build complex data structures",
      "Computer setup capable of running docker",
    ],
    curriculum: [
      {
        id: "01",
        title: "Data Extraction & SQL pipelines",
        meta: "Weeks 1-4",
        lessons: [
          {
            title: "Python for Data Pipelines: API requests & pagination",
            type: "live",
          },
          {
            title:
              "Advanced SQL: CTEs, analytical window functions & transformations",
            type: "video",
          },
        ],
        practice:
          "Create a python script to pull eCommerce sales and clean raw values",
        outcome:
          "Can extract raw dataset from remote REST APIs and execute SQL transformations.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Snowflake Data Warehousing",
        meta: "Weeks 5-8",
        lessons: [
          {
            title:
              "Snowflake Architecture: Virtual warehouses & Storage layers",
            type: "live",
          },
          {
            title: "Loading data using Snowpipe, COPY INTO & staging layers",
            type: "video",
          },
        ],
        practice:
          "Design and load structured business data into active Snowflake staging",
        outcome:
          "Design database warehousing structures and manage bulk cloud data loads.",
      },
      {
        id: "03",
        title: "Orchestration with Airflow & Capstone",
        meta: "Weeks 9-12",
        lessons: [
          {
            title: "Apache Airflow: DAGs, Operators, Tasks & scheduling",
            type: "live",
          },
          {
            title: "Data transformation modeling using dbt (Data Build Tool)",
            type: "video",
          },
          {
            title:
              "Completing and presenting end-to-end Pipeline Capstone project",
            type: "live",
          },
        ],
        practice:
          "Design Apache Airflow orchestrator DAG executing staging load",
        outcome:
          "Job-ready Data Engineer capable of orchestrating complex production pipelines.",
      },
    ],
    features: [
      "End-to-end data pipeline training from scratch",
      "Real tools used in top industries (Snowflake, Apache Airflow, dbt)",
      "Production-style projects that you can showcase on GitHub",
      "Includes direct training for Data Engineer, Analytics Engineer, ETL Developer roles",
    ],
  },
  {
    slug: "deep-learning",
    status: "COMING_SOON",
    title: "Deep Learning Job-Ready Bootcamp",
    subtitle: "Build Neural Networks, Computer Vision & Modern AI Systems",
    description:
      "Become a Deep Learning Engineer in 8 Weeks. Build neural networks, computer vision models, and modern AI systems using PyTorch & TensorFlow.",
    price: 399.0,
    priceINR: 34999,
    priceUSD: 399,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104634/deep-learning-light_ewrodc.png",
    heroImage: "/courses/deep-learning-hero.png",
    category: "AI & ML",
    level: "Advanced",
    duration: "8 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Image Classification System",
        description: "Build a CNN model to classify complex visual images.",
        icon: "photo_camera",
      },
      {
        title: "NLP Sentiment Classifier",
        description: "Develop a sequence-based text analysis network.",
        icon: "forum",
      },
      {
        title: "Deployed AI App",
        description:
          "Deploy a deep learning neural network as a web application.",
        icon: "cloud",
      },
      {
        title: "Capstone Transformer",
        description:
          "Train or fine-tune a modern transformer model for specific tasks.",
        icon: "verified",
      },
    ],
    tools: [
      { name: "PyTorch", icon: "pytorch" },
      { name: "TensorFlow", icon: "tensorflow" },
      { name: "CNNs & RNNs", icon: "psychology" },
      { name: "Transformers (NLP)", icon: "auto_awesome" },
      { name: "Model Deployment", icon: "cloud" },
    ],
    requirements: [
      "Good knowledge of Python and basic Machine Learning algorithms",
      "Basic familiarity with calculus and linear algebra",
    ],
    curriculum: [
      {
        id: "01",
        title: "Deep Neural Networks Foundations",
        meta: "Weeks 1-3",
        lessons: [
          {
            title:
              "Introduction to Neural Networks, Perceptron & Backpropagation",
            type: "live",
          },
          {
            title:
              "Loss functions, optimizers, learning rate & weight initialization",
            type: "video",
          },
        ],
        practice: "Build a multi-layer perceptron from scratch in PyTorch",
        outcome:
          "Understand mathematical foundations of neural networks and train simple models.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Computer Vision & CNNs",
        meta: "Weeks 4-6",
        lessons: [
          {
            title: "Convolutional Neural Networks: Padding, pooling, & strides",
            type: "live",
          },
          {
            title: "Transfer Learning: Fine-tuning ResNet & MobileNet",
            type: "video",
          },
        ],
        practice:
          "Build and train an image classifier on custom product images",
        outcome:
          "Implement convolutional architectures and leverage transfer learning for vision.",
      },
      {
        id: "03",
        title: "NLP & Transformers & Model Deployment",
        meta: "Weeks 7-8",
        lessons: [
          {
            title: "Recurrent networks, LSTMs & introduction to Transformers",
            type: "live",
          },
          {
            title:
              "Model optimization, quantization & deployment using FastAPI",
            type: "live",
          },
        ],
        practice:
          "Deploy an NLP or Image classification model on a live web app",
        outcome:
          "Be job-ready as a Deep Learning, AI, or Machine Learning Engineer with a deployed app.",
      },
    ],
    features: [
      "Hands-on model building with PyTorch & TensorFlow",
      "Learn real-world AI use cases: vision, text, and sequences",
      "Get model optimization and deployment training",
      "Prepares you for Deep Learning Engineer, AI Engineer, and ML Engineer roles",
    ],
  },
  {
    slug: "cybersecurity",
    status: "COMING_SOON",
    title: "Cybersecurity Job-Ready Bootcamp",
    subtitle: "Protect Systems, Detect Threats & Handle Security Incidents",
    description:
      "Master networking, system security, vulnerability assessment, SIEM & incident response. Become a job-ready Security Analyst in 12 weeks.",
    price: 399.0,
    priceINR: 34999,
    priceUSD: 399,
    image:
      "https://res.cloudinary.com/daafchadi/image/upload/v1779104635/cyber-security-light_fpvio2.png",
    heroImage: "/courses/cybersecurity-hero.png",
    category: "Cybersecurity",
    level: "Beginner",
    duration: "12 Weeks",
    liveInteractiveClasses: true,
    projects: [
      {
        title: "Network Analysis Lab",
        description:
          "Monitor network packet flows and isolate malicious actions.",
        icon: "security",
      },
      {
        title: "Vulnerability Assessment",
        description: "Scan system setups and generate security fixes reports.",
        icon: "report",
      },
      {
        title: "Security Audit Project",
        description:
          "Create a full threat modeling audit for enterprise networks.",
        icon: "verified",
      },
      {
        title: "SIEM Incident Response",
        description:
          "Configure SIEM dashboards and triage simulated network attacks.",
        icon: "dashboard",
      },
    ],
    tools: [
      { name: "Wireshark", icon: "wireshark" },
      { name: "Nmap", icon: "nmap" },
      { name: "Linux (Kali)", icon: "linux" },
      { name: "SIEM & Splunk", icon: "splunk" },
      { name: "Cloud Security", icon: "cloud" },
    ],
    requirements: [
      "Basic understanding of computers and operating systems",
      "No prior cybersecurity or programming experience required",
      "PC/Laptop capable of virtualization",
    ],
    curriculum: [
      {
        id: "01",
        title: "Networking & OS Security Foundations",
        meta: "Weeks 1-4",
        lessons: [
          {
            title: "TCP/IP models, routing protocols & network protocols",
            type: "live",
          },
          {
            title:
              "Linux systems administration, access controls & permissions",
            type: "video",
          },
        ],
        practice:
          "Perform port scans and traffic sniffing using Nmap & Wireshark",
        outcome:
          "Can analyze network architecture and manage fundamental OS security.",
        isOpen: true,
      },
      {
        id: "02",
        title: "Vulnerability Scan & SIEM Tracking",
        meta: "Weeks 5-8",
        lessons: [
          {
            title:
              "Vulnerability management: scanning, reporting & remediation",
            type: "live",
          },
          {
            title:
              "Introduction to SIEM platforms (Splunk/ELK stack) & log parsing",
            type: "video",
          },
        ],
        practice:
          "Scan a mock server using vulnerability scanner & analyze reports",
        outcome:
          "Identify network flaws and navigate SIEM systems for event log tracking.",
      },
      {
        id: "03",
        title: "Incident Handling & Cloud Security",
        meta: "Weeks 9-12",
        lessons: [
          {
            title:
              "Threat hunting, triage, incident containment & report structures",
            type: "live",
          },
          {
            title: "Cloud security concepts: IAM, AWS structures & guardrails",
            type: "video",
          },
          {
            title:
              "Completing security assessment audit & defense mock scenarios",
            type: "live",
          },
        ],
        practice:
          "Draft incident response report for a simulated ransomware attack",
        outcome:
          "Job-ready Cybersecurity Analyst, SOC Analyst or Security Associate.",
      },
    ],
    features: [
      "Hands-on training in virtual lab environment",
      "Learn actual attack, threat analysis, and defense concepts",
      "SOC operations & Splunk SIEM training",
      "Prepares you for Cybersecurity Analyst, SOC Analyst, and Security Associate roles",
    ],
  },
];

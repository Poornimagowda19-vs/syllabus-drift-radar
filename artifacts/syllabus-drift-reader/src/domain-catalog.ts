export type DomainId = 'ece' | 'cse' | 'ai-ml' | 'custom';

export type RoleId =
  | 'vlsi-design'
  | 'vlsi-verification'
  | 'embedded-systems'
  | 'software-developer'
  | 'cybersecurity-analyst'
  | 'ml-engineer'
  | 'ai-engineer'
  | 'data-scientist'
  | 'data-analyst'
  | 'custom';

export type RoleOption = { id: RoleId; label: string };
export type DomainOption = { id: DomainId; label: string };

export type SkillDefinition = {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  domains: DomainId[];
  roles: RoleId[];
  subjectHints: string[];
  topicSuggestion: string;
  labSuggestion: string;
};

export type SampleDemo = {
  domainId: Exclude<DomainId, 'custom'>;
  roleId: RoleId;
  customRoleTitle: string;
  syllabusFileName: string;
  syllabusText: string;
  jobs: { id: string; title: string; text: string }[];
};

export const DOMAIN_OPTIONS: DomainOption[] = [
  { id: 'ece', label: 'Electronics & Communication Engineering (ECE)' },
  { id: 'cse', label: 'Computer Science & Engineering (CSE/CS)' },
  { id: 'ai-ml', label: 'AI, Machine Learning & Data Science' },
  { id: 'custom', label: 'Other / Custom Domain' },
];

export const ROLE_OPTIONS: Record<DomainId, RoleOption[]> = {
  ece: [
    { id: 'vlsi-design', label: 'VLSI Design Engineer' },
    { id: 'vlsi-verification', label: 'VLSI Verification Engineer' },
    { id: 'embedded-systems', label: 'Embedded Systems Engineer' },
    { id: 'custom', label: 'Custom job title' },
  ],
  cse: [
    { id: 'software-developer', label: 'Software Developer' },
    { id: 'cybersecurity-analyst', label: 'Cybersecurity Analyst' },
    { id: 'custom', label: 'Custom job title' },
  ],
  'ai-ml': [
    { id: 'ml-engineer', label: 'Machine Learning Engineer' },
    { id: 'ai-engineer', label: 'AI Engineer' },
    { id: 'data-scientist', label: 'Data Scientist' },
    { id: 'data-analyst', label: 'Data Analyst' },
    { id: 'custom', label: 'Custom job title' },
  ],
  custom: [{ id: 'custom', label: 'Custom job title' }],
};

export function getRoleOptions(domainId: DomainId): RoleOption[] {
  return ROLE_OPTIONS[domainId] ?? [];
}

const ECE: DomainId[] = ['ece'];
const CSE: DomainId[] = ['cse'];
const AI_ML: DomainId[] = ['ai-ml'];

// Transparent phrase lists for the offline prototype. Additions should stay specific enough
// to produce useful evidence rather than broad semantic guesses.
export const SKILL_TAXONOMY: SkillDefinition[] = [
  {
    id: 'digital-design',
    name: 'Digital logic design',
    category: 'Digital hardware',
    aliases: ['digital design', 'digital designs', 'digital logic', 'logic design', 'combinational logic', 'sequential logic'],
    domains: ECE,
    roles: ['vlsi-design', 'vlsi-verification', 'embedded-systems'],
    subjectHints: ['digital logic', 'digital design', 'electronics'],
    topicSuggestion: 'Combinational and sequential logic design',
    labSuggestion: 'Implement and verify a small combinational or sequential logic block',
  },
  {
    id: 'verilog-systemverilog',
    name: 'Verilog & SystemVerilog',
    category: 'Digital hardware',
    aliases: ['Verilog', 'SystemVerilog', 'System Verilog', 'HDL', 'hardware description language', 'RTL coding'],
    domains: ECE,
    roles: ['vlsi-design', 'vlsi-verification'],
    subjectHints: ['digital design', 'VLSI', 'hardware design'],
    topicSuggestion: 'RTL description and simulation with Verilog/SystemVerilog',
    labSuggestion: 'Write and simulate a small RTL module with a self-checking testbench',
  },
  {
    id: 'fpga',
    name: 'FPGA design & prototyping',
    category: 'Digital hardware',
    aliases: ['FPGA', 'field programmable gate array', 'field-programmable gate array', 'FPGA prototyping', 'programmable logic'],
    domains: ECE,
    roles: ['vlsi-design', 'vlsi-verification', 'embedded-systems'],
    subjectHints: ['digital design', 'VLSI', 'embedded systems'],
    topicSuggestion: 'FPGA architecture, synthesis, and board-level prototyping',
    labSuggestion: 'Synthesize and test an RTL design on an FPGA development board',
  },
  {
    id: 'vlsi-asic-design',
    name: 'VLSI & ASIC design',
    category: 'VLSI design',
    aliases: ['VLSI design', 'ASIC design', 'CMOS VLSI', 'RTL synthesis', 'physical design', 'place and route'],
    domains: ECE,
    roles: ['vlsi-design'],
    subjectHints: ['VLSI', 'digital design', 'microelectronics'],
    topicSuggestion: 'ASIC design flow from RTL synthesis to physical design',
    labSuggestion: 'Run a small RTL synthesis flow and inspect area and timing reports',
  },
  {
    id: 'verification-uvm',
    name: 'Functional verification & UVM',
    category: 'VLSI verification',
    aliases: ['functional verification', 'UVM', 'Universal Verification Methodology', 'constrained-random verification', 'testbench', 'assertion-based verification', 'SystemVerilog assertions'],
    domains: ECE,
    roles: ['vlsi-verification'],
    subjectHints: ['VLSI', 'digital design', 'hardware verification'],
    topicSuggestion: 'Verification planning, assertions, and reusable UVM testbenches',
    labSuggestion: 'Create a self-checking testbench with directed and constrained-random tests',
  },
  {
    id: 'semiconductor-testing',
    name: 'Semiconductor testing & DFT',
    category: 'VLSI design',
    aliases: ['semiconductor testing', 'IC testing', 'design for test', 'DFT', 'scan chain', 'manufacturing test', 'semiconductor test'],
    domains: ECE,
    roles: ['vlsi-design', 'vlsi-verification'],
    subjectHints: ['VLSI', 'microelectronics', 'digital design'],
    topicSuggestion: 'Design-for-test concepts, scan design, and test coverage',
    labSuggestion: 'Inspect scan-chain behavior and reason about fault coverage in a small design',
  },
  {
    id: 'embedded-firmware',
    name: 'Embedded systems & firmware',
    category: 'Embedded systems',
    aliases: ['embedded systems', 'embedded C', 'firmware', 'microcontroller', 'ARM Cortex', 'bare-metal programming'],
    domains: ECE,
    roles: ['embedded-systems'],
    subjectHints: ['embedded systems', 'microcontroller', 'computer architecture'],
    topicSuggestion: 'Firmware structure, interrupts, and peripheral control',
    labSuggestion: 'Write firmware that reads a sensor and controls a microcontroller peripheral',
  },
  {
    id: 'real-time-systems',
    name: 'Real-time systems & RTOS',
    category: 'Embedded systems',
    aliases: ['real-time systems', 'real time systems', 'RTOS', 'real-time operating system', 'FreeRTOS', 'task scheduling'],
    domains: ECE,
    roles: ['embedded-systems'],
    subjectHints: ['embedded systems', 'operating systems', 'microcontroller'],
    topicSuggestion: 'Real-time scheduling, tasks, and synchronization',
    labSuggestion: 'Build a small RTOS task and measure deadline behavior',
  },
  {
    id: 'hardware-interfaces',
    name: 'Hardware interfaces & protocols',
    category: 'Embedded systems',
    aliases: ['I2C', 'SPI', 'UART', 'CAN bus', 'hardware interfaces', 'peripheral interfaces'],
    domains: ECE,
    roles: ['embedded-systems'],
    subjectHints: ['embedded systems', 'microcontroller', 'communication systems'],
    topicSuggestion: 'Serial hardware interfaces and protocol debugging',
    labSuggestion: 'Connect two peripherals over I2C, SPI, or UART and verify data exchange',
  },
  {
    id: 'digital-signal-processing',
    name: 'Digital signal processing',
    category: 'Signals & communications',
    aliases: ['digital signal processing', 'DSP', 'FIR filter', 'IIR filter', 'digital filtering', 'signal processing'],
    domains: ECE,
    roles: ['embedded-systems', 'vlsi-design'],
    subjectHints: ['signal processing', 'digital signal processing', 'communications'],
    topicSuggestion: 'Digital filter design and fixed-point implementation',
    labSuggestion: 'Implement and compare a digital filter using a sample signal',
  },
  {
    id: 'programming',
    name: 'Programming & object-oriented development',
    category: 'Programming & software',
    aliases: ['programming', 'Python', 'Java', 'C++', 'object-oriented programming', 'OOP', 'programming language'],
    domains: CSE,
    roles: ['software-developer', 'cybersecurity-analyst'],
    subjectHints: ['programming', 'software engineering', 'computer science'],
    topicSuggestion: 'Programming practice with modular, readable code',
    labSuggestion: 'Build a small application with functions, classes, and automated checks',
  },
  {
    id: 'data-structures-algorithms',
    name: 'Data structures & algorithms',
    category: 'Programming & software',
    aliases: ['data structures', 'algorithms', 'data structures and algorithms', 'algorithm design', 'complexity analysis'],
    domains: CSE,
    roles: ['software-developer', 'cybersecurity-analyst'],
    subjectHints: ['data structures', 'algorithms', 'computer science'],
    topicSuggestion: 'Core data structures, algorithm design, and complexity',
    labSuggestion: 'Implement and compare data structures on a practical problem',
  },
  {
    id: 'databases',
    name: 'Databases & SQL',
    category: 'Data & platforms',
    aliases: ['database', 'databases', 'SQL', 'relational database', 'database management system', 'database queries'],
    domains: CSE,
    roles: ['software-developer', 'cybersecurity-analyst'],
    subjectHints: ['database', 'data management', 'computer science'],
    topicSuggestion: 'Relational data modeling, SQL, and transactions',
    labSuggestion: 'Design a small schema and query it with joins and constraints',
  },
  {
    id: 'software-engineering',
    name: 'Software development & APIs',
    category: 'Software delivery',
    aliases: ['software development', 'software engineering', 'REST API', 'RESTful API', 'API development', 'web application'],
    domains: CSE,
    roles: ['software-developer'],
    subjectHints: ['software engineering', 'web development', 'programming'],
    topicSuggestion: 'Requirements, API design, and maintainable software architecture',
    labSuggestion: 'Build a small REST API and document its request and response behavior',
  },
  {
    id: 'software-quality',
    name: 'Software testing & quality',
    category: 'Software delivery',
    aliases: ['software testing', 'unit testing', 'integration testing', 'quality assurance', 'continuous integration', 'CI/CD'],
    domains: CSE,
    roles: ['software-developer', 'cybersecurity-analyst'],
    subjectHints: ['software engineering', 'programming', 'quality assurance'],
    topicSuggestion: 'Automated testing, code review, and continuous integration',
    labSuggestion: 'Add unit and integration tests to a small application',
  },
  {
    id: 'version-control',
    name: 'Git & collaborative development',
    category: 'Software delivery',
    aliases: ['Git', 'GitHub', 'version control', 'code review', 'branching'],
    domains: CSE,
    roles: ['software-developer', 'cybersecurity-analyst'],
    subjectHints: ['software engineering', 'programming'],
    topicSuggestion: 'Version control and collaborative code review',
    labSuggestion: 'Use branches and a code review to deliver a small change',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity fundamentals',
    category: 'Security',
    aliases: ['cybersecurity', 'cyber security', 'information security', 'secure coding', 'security assessment'],
    domains: CSE,
    roles: ['cybersecurity-analyst', 'software-developer'],
    subjectHints: ['cybersecurity', 'network security', 'computer networks'],
    topicSuggestion: 'Threat modeling and secure software fundamentals',
    labSuggestion: 'Review a sample application for common security weaknesses',
  },
  {
    id: 'network-security',
    name: 'Networks & security monitoring',
    category: 'Security',
    aliases: ['network security', 'TCP/IP', 'network protocols', 'SIEM', 'security monitoring', 'incident response', 'log analysis'],
    domains: CSE,
    roles: ['cybersecurity-analyst'],
    subjectHints: ['computer networks', 'network security', 'cybersecurity'],
    topicSuggestion: 'Network traffic, event logs, and incident triage',
    labSuggestion: 'Inspect a benign sample network capture and write an incident summary',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & deployment basics',
    category: 'Software delivery',
    aliases: ['cloud computing', 'AWS', 'Google Cloud', 'Microsoft Azure', 'Docker', 'containerization', 'deployment'],
    domains: CSE,
    roles: ['software-developer'],
    subjectHints: ['cloud computing', 'software engineering', 'operating systems'],
    topicSuggestion: 'Cloud deployment and container fundamentals',
    labSuggestion: 'Package and deploy a small service in a controlled sandbox',
  },
  {
    id: 'python',
    name: 'Python programming',
    category: 'Programming & data',
    aliases: ['Python', 'Python programming'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist', 'data-analyst'],
    subjectHints: ['programming', 'machine learning', 'data science'],
    topicSuggestion: 'Python workflows for data and model development',
    labSuggestion: 'Use Python to inspect, transform, and report on a small dataset',
  },
  {
    id: 'statistics',
    name: 'Statistics & probability',
    category: 'Data & foundations',
    aliases: ['statistics', 'probability', 'statistical inference', 'hypothesis testing', 'probability distributions'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist', 'data-analyst'],
    subjectHints: ['statistics', 'mathematics', 'data science'],
    topicSuggestion: 'Applied probability, inference, and uncertainty',
    labSuggestion: 'Use a dataset to test and explain a statistical hypothesis',
  },
  {
    id: 'data-preparation',
    name: 'Data cleaning & preprocessing',
    category: 'Programming & data',
    aliases: ['data cleaning', 'data preprocessing', 'data wrangling', 'missing values', 'pandas'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist', 'data-analyst'],
    subjectHints: ['data science', 'database', 'programming'],
    topicSuggestion: 'Data quality checks and preprocessing workflows',
    labSuggestion: 'Clean a messy dataset and document preprocessing decisions',
  },
  {
    id: 'machine-learning',
    name: 'Machine learning',
    category: 'Model development',
    aliases: ['machine learning', 'supervised learning', 'classification', 'regression', 'unsupervised learning'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist'],
    subjectHints: ['machine learning', 'artificial intelligence', 'data science'],
    topicSuggestion: 'Core machine-learning methods and their use cases',
    labSuggestion: 'Train and compare classification and regression models',
  },
  {
    id: 'deep-learning',
    name: 'Deep learning & neural networks',
    category: 'Model development',
    aliases: ['deep learning', 'neural networks', 'PyTorch', 'TensorFlow', 'transformers'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist'],
    subjectHints: ['machine learning', 'artificial intelligence'],
    topicSuggestion: 'Neural networks and deep-learning fundamentals',
    labSuggestion: 'Build and evaluate a small neural network with a framework',
  },
  {
    id: 'model-evaluation',
    name: 'Model evaluation & validation',
    category: 'Model development',
    aliases: ['model evaluation', 'cross-validation', 'cross validation', 'precision', 'recall', 'F1 score', 'ROC-AUC', 'RMSE'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist'],
    subjectHints: ['machine learning', 'statistics', 'data science'],
    topicSuggestion: 'Validation strategy, metric selection, and error analysis',
    labSuggestion: 'Evaluate models with cross-validation and task-appropriate metrics',
  },
  {
    id: 'ai-systems',
    name: 'AI systems & responsible use',
    category: 'Model development',
    aliases: ['artificial intelligence', 'AI systems', 'generative AI', 'large language model', 'LLM', 'responsible AI'],
    domains: AI_ML,
    roles: ['ai-engineer', 'ml-engineer'],
    subjectHints: ['artificial intelligence', 'machine learning', 'data science'],
    topicSuggestion: 'AI system evaluation, limitations, and responsible use',
    labSuggestion: 'Evaluate an AI system against a documented set of test cases',
  },
  {
    id: 'data-visualization',
    name: 'Data visualization & reporting',
    category: 'Analytics practice',
    aliases: ['data visualization', 'data visualisation', 'Tableau', 'Power BI', 'dashboard', 'matplotlib', 'seaborn'],
    domains: AI_ML,
    roles: ['data-scientist', 'data-analyst'],
    subjectHints: ['data visualization', 'data science', 'business intelligence'],
    topicSuggestion: 'Visual communication of analytical results',
    labSuggestion: 'Build a dashboard that answers a defined stakeholder question',
  },
  {
    id: 'sql-analytics',
    name: 'SQL & analytical querying',
    category: 'Programming & data',
    aliases: ['SQL', 'analytical queries', 'database queries', 'relational database'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist', 'data-analyst'],
    subjectHints: ['database', 'data engineering', 'data science'],
    topicSuggestion: 'SQL joins, aggregations, and analytical queries',
    labSuggestion: 'Query a course dataset with joins and aggregations',
  },
  {
    id: 'experiment-tracking',
    name: 'Experiment tracking & reproducibility',
    category: 'Reliable AI systems',
    aliases: ['experiment tracking', 'MLflow', 'Weights & Biases', 'wandb', 'reproducible experiments'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer', 'data-scientist'],
    subjectHints: ['machine learning', 'software engineering', 'data science'],
    topicSuggestion: 'Reproducible experiments and model-version records',
    labSuggestion: 'Track model runs and compare results with an experiment log',
  },
  {
    id: 'model-serving',
    name: 'Model deployment & serving',
    category: 'Reliable AI systems',
    aliases: ['model serving', 'REST API', 'FastAPI', 'inference endpoint', 'model deployment', 'MLOps'],
    domains: AI_ML,
    roles: ['ml-engineer', 'ai-engineer'],
    subjectHints: ['software engineering', 'machine learning', 'cloud computing'],
    topicSuggestion: 'Model inference APIs, deployment, and monitoring',
    labSuggestion: 'Wrap a trained model in a small inference API and test it',
  },
  {
    id: 'ab-testing',
    name: 'A/B testing & experimentation',
    category: 'Analytics practice',
    aliases: ['A/B testing', 'AB testing', 'controlled experiment', 'online experiment'],
    domains: AI_ML,
    roles: ['data-scientist', 'data-analyst'],
    subjectHints: ['statistics', 'data science', 'analytics'],
    topicSuggestion: 'Experiment design, guardrail metrics, and A/B testing',
    labSuggestion: 'Analyze a small A/B test and explain its limits',
  },
  {
    id: 'custom-documentation',
    name: 'Documentation & communication',
    category: 'Transferable skills',
    aliases: ['documentation', 'technical documentation', 'written communication', 'stakeholder communication', 'present findings'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['communication', 'professional practice'],
    topicSuggestion: 'Technical documentation and communicating results',
    labSuggestion: 'Prepare a concise report for a non-specialist stakeholder',
  },
  {
    id: 'custom-quality',
    name: 'Quality checks & testing',
    category: 'Transferable skills',
    aliases: ['quality assurance', 'quality checks', 'testing', 'inspection', 'validation'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['quality assurance', 'professional practice'],
    topicSuggestion: 'Quality assurance and repeatable checking methods',
    labSuggestion: 'Create a checklist and test it against a sample work product',
  },
  {
    id: 'custom-projects',
    name: 'Project planning & teamwork',
    category: 'Transferable skills',
    aliases: ['project management', 'project planning', 'Agile', 'Scrum', 'cross-functional collaboration', 'teamwork'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['project management', 'professional practice'],
    topicSuggestion: 'Project planning, iteration, and team coordination',
    labSuggestion: 'Plan and review a small team deliverable using milestones',
  },
  {
    id: 'custom-analysis',
    name: 'Data analysis & reporting',
    category: 'Transferable skills',
    aliases: ['data analysis', 'Excel', 'spreadsheet analysis', 'reporting', 'metrics'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['data analysis', 'professional practice'],
    topicSuggestion: 'Practical data analysis and reporting',
    labSuggestion: 'Analyze a small domain-relevant dataset and summarize findings',
  },
  {
    id: 'custom-safety',
    name: 'Safety & compliance',
    category: 'Transferable skills',
    aliases: ['safety', 'workplace safety', 'compliance', 'regulatory compliance', 'standard operating procedure', 'SOP'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['safety', 'compliance', 'professional practice'],
    topicSuggestion: 'Relevant safety, standards, and compliance practices',
    labSuggestion: 'Apply a relevant safety or compliance checklist to a case study',
  },
  {
    id: 'custom-troubleshooting',
    name: 'Troubleshooting & root-cause analysis',
    category: 'Transferable skills',
    aliases: ['troubleshooting', 'root cause analysis', 'root-cause analysis', 'diagnostics', 'problem solving'],
    domains: ['custom'],
    roles: ['custom'],
    subjectHints: ['professional practice', 'systems'],
    topicSuggestion: 'Structured troubleshooting and root-cause analysis',
    labSuggestion: 'Diagnose a realistic fault using a repeatable troubleshooting process',
  },
];

export const SAMPLE_DEMOS: Record<Exclude<DomainId, 'custom'>, SampleDemo> = {
  ece: {
    domainId: 'ece',
    roleId: 'vlsi-design',
    customRoleTitle: '',
    syllabusFileName: 'Illustrative ECE sample syllabus · not institution-verified',
    syllabusText: `Illustrative ECE sample syllabus — not verified against a real institution
Digital Logic Design
Combinational logic design laboratory: gates, multiplexers, and decoders
Sequential logic and finite-state machines
Verilog and SystemVerilog HDL
RTL coding lab: simulate counters and finite-state machines
VLSI Design
CMOS VLSI design fundamentals and ASIC design flow
FPGA prototyping lab: synthesize and test a simple datapath
Semiconductor devices and fabrication
Embedded Systems
Microcontroller architecture and embedded C
Signals and Systems
Digital signal processing and FIR filter design`,
    jobs: [
      {
        id: 'sample-ece-vlsi',
        title: 'SAMPLE AD · VLSI Design Engineer',
        text: 'A VLSI Design Engineer develops RTL using Verilog and SystemVerilog, synthesizes and debugs digital designs, and supports FPGA prototyping. The role works across ASIC design, physical design, timing analysis, and design-for-test (DFT), and collaborates with semiconductor testing teams.',
      },
    ],
  },
  cse: {
    domainId: 'cse',
    roleId: 'software-developer',
    customRoleTitle: '',
    syllabusFileName: 'Illustrative CSE/CS sample syllabus · not institution-verified',
    syllabusText: `Illustrative CSE/CS sample syllabus — not verified against a real institution
Programming Fundamentals
Java programming and object-oriented programming lab
Data Structures and Algorithms
Implementations of lists, trees, graphs, and sorting algorithms
Database Management Systems
Relational database design and SQL query laboratory
Software Engineering
Team software project using Git and code review
Operating Systems
Process scheduling, memory management, and concurrency
Computer Networks
TCP/IP and network protocol fundamentals
Cybersecurity Fundamentals
Secure coding principles and threat modeling`,
    jobs: [
      {
        id: 'sample-cse-swe',
        title: 'SAMPLE AD · Software Developer',
        text: 'A Software Developer builds and maintains services using Java or Python, designs REST APIs, and works with relational databases and SQL. The team expects Git-based collaboration, unit and integration testing, CI/CD, cloud deployment, secure coding, and clear documentation.',
      },
    ],
  },
  'ai-ml': {
    domainId: 'ai-ml',
    roleId: 'ml-engineer',
    customRoleTitle: '',
    syllabusFileName: 'Illustrative AI/ML sample syllabus · not institution-verified',
    syllabusText: `Illustrative AI/ML sample syllabus — not verified against a real institution
Programming for Data Science
Python programming with pandas and scikit-learn
Data cleaning and preprocessing laboratory
Database Systems
Relational databases and SQL joins lab
Probability and Statistical Inference
Probability distributions and hypothesis testing
Machine Learning
Supervised learning: classification and regression
Machine learning project: train and compare two classifiers
Feature engineering fundamentals
Cross-validation and model evaluation metrics
Software Engineering
Team software project using Git and code reviews`,
    jobs: [
      {
        id: 'sample-ai-ml',
        title: 'SAMPLE AD · Machine Learning Engineer',
        text: 'A Machine Learning Engineer uses Python and scikit-learn or PyTorch to build and evaluate models. The work includes statistics, data preprocessing, feature engineering, supervised learning, deep learning, model evaluation with cross-validation and F1, experiment tracking with MLflow, model deployment through REST APIs, and production monitoring for data drift.',
      },
    ],
  },
};

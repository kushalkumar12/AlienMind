import type { Labels, Interviewer, Candidate, ReportCategory, TimeRange } from '../types';

// ─── Default Labels ──────────────────────────────────────────────────────────
export const DEFAULT_LABELS: Labels = {
  'app.name': 'AllienMind',
  'auth.hero.title': 'Practice interviews live, get rated, and become hire-ready.',
  'auth.hero.subtitle':
    'Candidate login, interviewer registration, paid mock interviews, recorded sessions, voice text, ratings, and company search all start here.',
  'dashboard.hero.title': 'LinkedIn-style talent network with Zoom-style mock interviews.',
  'dashboard.hero.subtitle':
    'Candidates meet people who already crossed their target level, receive ranked feedback, control recordings, and become discoverable to companies.',
  'room.title': 'Live interview room',
  'search.interviewer.title': 'Find interviewers',
  'search.candidate.title': 'Search candidates',
  'result.title': 'Candidate result',
  'transcript.title': 'Real-time voice text',
};

// ─── Mock Data (replace with API calls when ready) ───────────────────────────
export const MOCK_INTERVIEWERS: Interviewer[] = [
  {
    id: 1,
    name: 'Rohan Mehta',
    rankTitle: 'Ex-FAANG Senior Engineer',
    price: 45,
    skills: ['System Design', 'Java', 'Distributed Systems'],
    rating: 4.8,
    completed: 126,
  },
  {
    id: 2,
    name: 'Maya Iyer',
    rankTitle: 'Staff Frontend Engineer',
    price: 35,
    skills: ['React', 'TypeScript', 'UI Architecture'],
    rating: 4.7,
    completed: 88,
  },
  {
    id: 3,
    name: 'Elena Garcia',
    rankTitle: 'Principal Data Engineer',
    price: 55,
    skills: ['PostgreSQL', 'Data Modeling', 'Python'],
    rating: 4.9,
    completed: 154,
  },
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: 'Anika Sharma',
    level: 'Backend Foundation',
    skills: ['Java', 'Spring Boot', 'PostgreSQL'],
    summary: 'Preparing for senior backend interviews.',
    score: 7.8,
    completed: 6,
    publicResults: true,
    publicRecordings: false,
  },
  {
    id: 2,
    name: 'Karan Patel',
    level: 'Frontend Advanced',
    skills: ['React', 'Accessibility', 'Testing'],
    summary: 'Targeting product engineering roles.',
    score: 8.4,
    completed: 9,
    publicResults: true,
    publicRecordings: true,
  },
  {
    id: 3,
    name: 'Priya Nair',
    level: 'System Design Ready',
    skills: ['Microservices', 'Redis', 'Kafka'],
    summary: 'Practicing architecture rounds.',
    score: 8.1,
    completed: 11,
    publicResults: false,
    publicRecordings: false,
  },
];

// ─── Admin — Reports ─────────────────────────────────────────────────────────
export const REPORT_CATEGORIES: ReportCategory[] = [
  { id: 'users',      label: 'Total Users',          icon: '👥', value: '4,289',  delta: '+12%', positive: true,  bars: [40, 55, 48, 72, 60, 85, 100] },
  { id: 'interviews', label: 'Active Interviews',    icon: '🎤', value: '156',    delta: '+5%',  positive: true,  bars: [30, 40, 55, 45, 65, 78, 90] },
  { id: 'issues',     label: 'Reported Issues',      icon: '🐛', value: '12',     delta: '−2%', positive: false, bars: [80, 70, 60, 75, 50, 45, 30] },
  { id: 'score',      label: 'Avg. Candidate Score', icon: '⭐', value: '7.4/10', delta: '+0.2', positive: true,  bars: [60, 62, 65, 68, 70, 72, 74] },
  { id: 'revenue',    label: 'Platform Revenue',     icon: '💰', value: '$8,420', delta: '+18%', positive: true,  bars: [20, 35, 50, 60, 70, 85, 100] },
  { id: 'companies',  label: 'Active Companies',     icon: '🏢', value: '237',    delta: '+7%',  positive: true,  bars: [45, 50, 55, 60, 68, 75, 85] },
  { id: 'candidates', label: 'Registered Candidates',icon: '🎓', value: '3,814',  delta: '+11%', positive: true,  bars: [35, 45, 55, 65, 72, 80, 90] },
  { id: 'sessions',   label: 'Completed Sessions',   icon: '✅', value: '1,092',  delta: '+9%',  positive: true,  bars: [30, 38, 50, 60, 70, 82, 95] },
];

export const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '1H',     label: '1 Hour' },
  { key: '12H',    label: '12 Hour' },
  { key: '1D',     label: 'Day' },
  { key: '1W',     label: 'Week' },
  { key: '1M',     label: 'Month' },
  { key: '3M',     label: 'Quarter' },
  { key: '6M',     label: 'Half Year' },
  { key: '1Y',     label: 'Year' },
  { key: 'ALL',    label: 'Entire' },
  { key: 'CUSTOM', label: 'Custom' },
];

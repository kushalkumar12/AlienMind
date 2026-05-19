// ─── Domain Types ───────────────────────────────────────────────────────────

export type Role = 'CANDIDATE' | 'INTERVIEWER' | 'COMPANY' | 'ADMIN';

export type AuthMode = 'login' | 'register';

export type Labels = Record<string, string>;

export type SessionUser = {
  name: string;
  email: string;
  role: Role;
  userId?: number;
};

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export type DashboardTab = 'home' | 'interviews' | 'ai-mock' | 'connections' | 'messaging' | 'notifications' | 'progress';

export interface JobPost {
  id: number;
  title: string;
  companyName: string;
  siteName: string;
  postedAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'ALERT' | 'AI' | 'CONNECTION' | 'HIRING';
  isRead: boolean;
  time: string;
}

export interface Interview {
  id: number;
  interviewerName: string;
  status: string;
  scheduledAt: string;
  roomUrl: string;
}

export interface Connection {
  id: number;
  name: string;
  role: string;
  avatarColor: string;
  status: 'PENDING' | 'ACCEPTED';
  connectionId: number;
}

export interface MessageSummary {
  id: number;
  partnerName: string;
  lastMessage: string;
  time: string;
}

export type CandidateDashboardData = {
  profileId: number;
  userId: number;
  fullName: string;
  email: string;
  currentLevel: string;
  skills: string[];
  summary: string;
  averageRating: number;
  completedInterviews: number;
  publicResults: boolean;
  publicRecordings: boolean;
  
  // Real-time Dynamic Data
  trendingJobs: JobPost[];
  recentNotifications: Notification[];
  upcomingInterviews: Interview[];
  connections: Connection[];
  recentMessages: MessageSummary[];
  analytics: {
    readinessScore: number;
    successRate: number;
    globalRank: string;
    trend: { label: string; score: number }[];
    skillPerformance: { name: string; score: number; trend: string }[];
  };

  // AI & Networking Premium Fields
  networkingInsights?: {
    suggestedMentors: number;
    suggestedPartners: number;
    matchRate: number;
    activeSessions: number;
  };
};

export interface Connection {
  id: number;
  name: string;
  role: string;
  avatarColor: string;
  status: 'PENDING' | 'ACCEPTED';
  isRequester?: boolean;
  connectionId: number;
  
  // Premium Details
  expertise?: string[];
  skillMatch?: number;
  aiCompatibility?: number;
  experienceLevel?: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  availability?: 'Available' | 'Busy' | 'Offline';
  mutualConnections?: number;
}

export type CompanyDashboardData = {
  profileId: number;
  companyName: string;
  contactEmail: string;
  hiringFocus: string;
  topCandidates: any[];
  featuredInterviewers: any[];
  totalCandidates: number;
  totalInterviewers: number;
  totalCompanies: number;
};

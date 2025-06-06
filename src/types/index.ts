
export interface UserModel {
  skillLevel: number; // 1-5
  fallacyAccuracyHistory: Record<string, number>; // fallacy type -> accuracy percentage
  commonMistakes: string[]; // frequently misidentified patterns
  lastPerformanceScore: number; // 0-1
  totalPracticeCount: number;
  totalDebateCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Enhanced user model for research
  preferredTopics: string[]; // e.g., ["politics", "ethics", "technology"]
  averageSpeechTime: number; // in seconds
  lastCoherenceScore: number; // 0-100
  fillerWordRate: number; // percentage
  emotionalRatings: number[]; // recent confidence ratings
  badgesEarned: string[]; // e.g., ["Quick Thinker", "Filler Beater"]
  profileCompleted: boolean;
}

export interface FallacyExample {
  id: string;
  type: string;
  argument: string;
  explanation: string;
  difficulty: number; // 1-5
  hasFallacy: boolean;
  fallacyLocation?: { start: number; end: number };
}

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  forPosition: string;
  againstPosition: string;
  category: string; // e.g., "politics", "ethics", "technology"
}

export interface DebateMessage {
  id: string;
  speaker: 'user' | 'ai';
  content: string;
  round: number;
  timestamp: string;
  fallacies?: string[];
  coaching?: string;
  speechDuration?: number; // in seconds
  fillerWordCount?: number;
  factualClaimCount?: number;
}

export interface DebateSession {
  id: string;
  topic: DebateTopic;
  userPosition: 'for' | 'against';
  messages: DebateMessage[];
  currentRound: number;
  score: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  coherenceScore: number; // 0-100
  emotionalRating?: number; // 1-5 confidence rating
  adaptivePrompts: string[]; // personalized tips shown during debate
}

export interface UsabilityMetrics {
  timeToComplete: number; // seconds
  easeOfUse: number; // 1-7 Likert scale
  accuracy: number; // 0-1
  errorsCount: number;
  hintsUsed: number;
}

export interface EmotionalMetrics {
  pleasure: number; // -4 to +4 SAM scale
  arousal: number; // -4 to +4 SAM scale
  dominance: number; // -4 to +4 SAM scale
  timestamp: string;
  confidence: number; // 1-5 post-debate confidence
  frustration: number; // 1-5 frustration level
}

export interface StudySession {
  id: string;
  participantId: string;
  version: 'random' | 'personalized';
  orderPosition: number; // 1 or 2 (for counterbalancing)
  usabilityMetrics: UsabilityMetrics;
  emotionalMetrics: EmotionalMetrics;
  startTime: string;
  endTime: string;
  completed: boolean;
}

export interface AppSettings {
  isPersonalized: boolean;
  llmApiKey?: string;
  studyMode: boolean;
  participantId?: string;
  currentVersion?: 'random' | 'personalized';
  onboardingCompleted: boolean;
  microphoneEnabled: boolean;
}

export interface UserFeedback {
  id: string;
  userId: string;
  rating: number; // 1-5 stars
  feedback: string;
  feature: string; // what they liked most
  painPoint: string; // biggest frustration
  timestamp: string;
}

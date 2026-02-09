export interface User {
  userId: string;
  nickname: string;
  age: number;
  language: string;
  country?: string;
  preferredInputMethod?: 'text' | 'voice' | 'mixed';
  createdAt: string;
  lastActive?: string;
}

export interface ConversationMessage {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  input_method?: string;
  timestamp: string;
}

export interface ConversationSession {
  session_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  messages: ConversationMessage[];
}

export interface CareerRecommendation {
  recommendation_id: string;
  career_path_id: string;
  career_name: string;
  description: string;
  match_reason: string;
  skills_needed: string[];
  example_jobs: string[];
  education_path: string;
  growth_potential: string;
  is_custom: boolean;
}

export interface UserProfile {
  profile_id: string;
  interests: string[];
  strengths: string[];
  values: string[];
  learning_style?: string;
  motivation_level?: number;
  career_preferences?: any;
}


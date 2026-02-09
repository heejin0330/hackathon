// 메모리 기반 저장소 (DB 없이 동작)
// 서버 재시작 시 데이터는 사라집니다

interface User {
  userId: string;
  nickname: string;
  age: number;
  language: string;
  country?: string | null;
  preferredInputMethod?: string | null;
  createdAt: Date;
  lastActive: Date;
}

interface ConversationSession {
  sessionId: string;
  userId: string;
  status: 'in_progress' | 'completed';
  language: string;
  createdAt: Date;
  completedAt?: Date;
}

interface ConversationMessage {
  messageId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  inputMethod?: string;
  timestamp: Date;
  geminiMetadata?: any;
}

interface UserProfile {
  profileId: string;
  userId: string;
  sessionId?: string | null;
  interests: string[];
  strengths: string[];
  values: string[];
  learningStyle?: string | null;
  motivationLevel?: string | null;
  careerPreferences?: string | null;
  mentalHealthFlags: string[];
  geminiAnalysisRaw?: any;
  createdAt: Date;
}

interface CareerRecommendation {
  recommendationId: string;
  profileId: string;
  careerPathId: string;
  careerName: string;
  description: string | null;
  matchReason: string | null;
  skillsNeeded: string[];
  exampleJobs: string[];
  educationPath: string | null;
  growthPotential: string | null;
  isCustom: boolean;
  displayOrder: number | null;
  createdAt: Date;
}

interface VisionBoardImage {
  imageId: string;
  userId: string;
  recommendationId?: string | null;
  imageUrl: string;
  style: string;
  generatedAt: Date;
}

class MemoryStore {
  private users = new Map<string, User>();
  private sessions = new Map<string, ConversationSession>();
  private messages = new Map<string, ConversationMessage[]>();
  private profiles = new Map<string, UserProfile>();
  private recommendations = new Map<string, CareerRecommendation[]>();
  private visionBoards = new Map<string, VisionBoardImage[]>();

  // Users
  createUser(data: Omit<User, 'userId' | 'createdAt' | 'lastActive'>): User {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      ...data,
      userId,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  // Sessions
  createSession(data: Omit<ConversationSession, 'sessionId' | 'createdAt'>): ConversationSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ConversationSession = {
      ...data,
      sessionId,
      createdAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    this.messages.set(sessionId, []);
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, data: Partial<ConversationSession>): ConversationSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    const updated = { ...session, ...data };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  // Messages
  addMessage(data: Omit<ConversationMessage, 'messageId' | 'timestamp'>): ConversationMessage {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: ConversationMessage = {
      ...data,
      messageId,
      timestamp: new Date(),
    };
    const messages = this.messages.get(data.sessionId) || [];
    messages.push(message);
    this.messages.set(data.sessionId, messages);
    return message;
  }

  getMessages(sessionId: string): ConversationMessage[] {
    return this.messages.get(sessionId) || [];
  }

  // Profiles
  createProfile(data: Omit<UserProfile, 'profileId' | 'createdAt'>): UserProfile {
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const profile: UserProfile = {
      ...data,
      profileId,
      createdAt: new Date(),
    };
    this.profiles.set(profileId, profile);
    return profile;
  }

  getProfile(profileId: string): UserProfile | undefined {
    return this.profiles.get(profileId);
  }

  getProfilesByUserId(userId: string): UserProfile[] {
    return Array.from(this.profiles.values()).filter(p => p.userId === userId);
  }

  // Recommendations
  addRecommendation(data: Omit<CareerRecommendation, 'recommendationId' | 'createdAt'>): CareerRecommendation {
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const recommendation: CareerRecommendation = {
      ...data,
      recommendationId,
      createdAt: new Date(),
    };
    const recommendations = this.recommendations.get(data.profileId) || [];
    recommendations.push(recommendation);
    this.recommendations.set(data.profileId, recommendations);
    return recommendation;
  }

  getRecommendations(profileId: string): CareerRecommendation[] {
    return this.recommendations.get(profileId) || [];
  }

  getRecommendationById(recommendationId: string): { recommendation: CareerRecommendation; profileId: string } | undefined {
    for (const [profileId, recs] of this.recommendations.entries()) {
      const rec = recs.find(r => r.recommendationId === recommendationId);
      if (rec) {
        return { recommendation: rec, profileId };
      }
    }
    return undefined;
  }

  // Vision Boards
  addVisionBoard(data: Omit<VisionBoardImage, 'imageId' | 'generatedAt'>): VisionBoardImage {
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const image: VisionBoardImage = {
      ...data,
      imageId,
      generatedAt: new Date(),
    };
    const images = this.visionBoards.get(data.userId) || [];
    images.push(image);
    this.visionBoards.set(data.userId, images);
    return image;
  }

  getVisionBoards(userId: string): VisionBoardImage[] {
    return this.visionBoards.get(userId) || [];
  }

  getVisionBoard(imageId: string): VisionBoardImage | undefined {
    for (const images of this.visionBoards.values()) {
      const image = images.find(img => img.imageId === imageId);
      if (image) return image;
    }
    return undefined;
  }
}

// 싱글톤 인스턴스
export const memoryStore = new MemoryStore();


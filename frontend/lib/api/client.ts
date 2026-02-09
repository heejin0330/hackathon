const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('session_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('session_token', token);
      } else {
        localStorage.removeItem('session_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Unknown error',
        }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Users API
  async createUser(data: {
    nickname: string;
    age: number;
    language: string;
    country?: string;
    preferredInputMethod?: 'text' | 'voice' | 'mixed';
  }) {
    const response = await this.request<{
      user_id: string;
      session_token: string;
      message: string;
    }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.session_token) {
      this.setToken(response.session_token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<{
      userId: string;
      nickname: string;
      age: number;
      language: string;
      country?: string;
      preferredInputMethod?: string;
      createdAt: string;
      lastActive?: string;
    }>('/api/users/me');
  }

  // Conversations API
  async startConversation() {
    return this.request<{
      session_id: string;
      first_message: {
        role: string;
        content: string;
        timestamp: string;
      };
    }>('/api/conversations/start', {
      method: 'POST',
    });
  }

  async sendMessage(sessionId: string, content: string, inputMethod: string = 'text') {
    return this.request<{
      message_id: string;
      ai_response: {
        role: string;
        content: string;
        timestamp: string;
      };
      progress: number;
    }>(`/api/conversations/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, input_method: inputMethod }),
    });
  }

  async getConversation(sessionId: string) {
    return this.request<{
      session_id: string;
      status: string;
      started_at: string;
      completed_at?: string;
      messages: Array<{
        message_id: string;
        role: string;
        content: string;
        input_method?: string;
        timestamp: string;
      }>;
    }>(`/api/conversations/${sessionId}`);
  }

  // Recommendations API
  async analyzeConversation(sessionId: string) {
    return this.request<{
      profile_id: string;
      analysis: {
        interests: string[];
        strengths: string[];
        values: string[];
        learning_style?: string;
        motivation_level?: number;
        career_preferences?: any;
      };
    }>(`/api/conversations/${sessionId}/analyze`, {
      method: 'POST',
    });
  }

  async getRecommendations(profileId: string) {
    return this.request<{
      recommendations: Array<{
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
      }>;
    }>(`/api/recommendations/${profileId}`);
  }

  async addCustomCareer(profileId: string, customCareerName: string) {
    return this.request<{
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
    }>('/api/recommendations/custom', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: profileId,
        custom_career_name: customCareerName,
      }),
    });
  }

  // Vision Board API
  async generateVisionBoard(recommendationId: string, style: string = 'magazine_cover') {
    return this.request<{
      image_id: string;
      style: string;
      career_name: string;
      vision_data: {
        title: string;
        year: string;
        role: string;
        company: string;
        description: string;
        achievements: string[];
        quote: string;
        milestones: Array<{ year: string; event: string }>;
        daily_life: string;
      };
      generated_at: string;
    }>('/api/vision-board/generate', {
      method: 'POST',
      body: JSON.stringify({
        recommendation_id: recommendationId,
        style,
      }),
    });
  }

  async getVisionBoard(imageId: string) {
    return this.request<{
      image_id: string;
      style: string;
      career_name: string;
      vision_data: any;
      generated_at: string;
    }>(`/api/vision-board/${imageId}`);
  }

  async getUserVisionBoards() {
    return this.request<{
      vision_boards: Array<{
        image_id: string;
        style: string;
        career_name: string;
        vision_data: any;
        generated_at: string;
      }>;
    }>('/api/vision-board/user/all');
  }
}

export const apiClient = new ApiClient();


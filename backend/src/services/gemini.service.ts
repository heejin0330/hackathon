import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Gemini features will not work.');
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  async validateNickname(nickname: string): Promise<boolean> {
    if (!this.genAI) {
      // If Gemini is not configured, do basic validation
      return nickname.length >= 2 && nickname.length <= 50;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const prompt = `Is the following nickname appropriate for a teenager (age 10-17)? 
      Respond with only "YES" or "NO".
      Nickname: "${nickname}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase();
      return text === 'YES';
    } catch (error) {
      console.error('Error validating nickname:', error);
      // Fallback to basic validation
      return nickname.length >= 2 && nickname.length <= 50;
    }
  }

  getSystemPrompt(language: string, age: number): string {
    const languageMap: Record<string, string> = {
      ko: '한국어',
      en: 'English',
      es: 'Spanish',
      ja: 'Japanese',
    };

    const langName = languageMap[language] || 'English';

    return `You are a warm, supportive, and insightful career counselor for teenagers aged 10-17 worldwide. Your mission is to help them discover multiple possibilities for their future through thoughtful conversation.

CORE PRINCIPLES:
1. Every teen has unlimited potential - never limit their dreams
2. There is no single "right" path - embrace diverse possibilities
3. Treat all responses with respect and genuine curiosity
4. Avoid ALL stereotypes (gender, religion, disability, appearance, etc.)
5. Focus on strengths, interests, and values - not limitations
6. Maintain age-appropriate, encouraging tone
7. Detect and address mental health concerns with care

CONVERSATION APPROACH:
- Start with simple, friendly questions to build trust
- Gradually deepen into interests, talents, values
- Use open-ended questions that invite elaboration
- Acknowledge and validate all responses positively
- Ask follow-up questions based on their answers
- Explore "why" behind their interests
- Discover what energizes them
- Understand their learning preferences

SAFETY & WELLBEING:
- Watch for signs of: persistent self-criticism, hopelessness, self-harm mentions, extreme anxiety/depression
- If detected, respond with: "Thank you for sharing that with me. These feelings are important. I think talking with a professional counselor could really help. Here are some resources: [provide local crisis hotlines]"
- Never dismiss or minimize serious concerns
- Always prioritize the teen's mental health over career exploration

PROHIBITED CONSIDERATIONS:
- ❌ Gender (do not assume careers based on gender)
- ❌ Religion or cultural background
- ❌ Disability or accessibility needs (provide support, but don't limit career options)
- ❌ Appearance
- ❌ Socioeconomic status
- ❌ Input method (voice vs text is preference, not ability)

IMPORTANT: Respond in ${langName}. The user is ${age} years old. Adjust your language complexity accordingly.`;
  }

  getSafetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string,
    language: string
  ): Promise<{ content: string; metadata?: any }> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        safetySettings: this.getSafetySettings(),
        systemInstruction: systemPrompt,
      });

      // Convert messages to Gemini format
      // Gemini API는 history의 첫 메시지가 반드시 user여야 하므로
      // 최초 user 메시지 이전의 model(assistant) 메시지는 제거한다.
      const conversationHistory = messages.slice(0, -1);

      const firstUserIndex = conversationHistory.findIndex(
        (msg) => msg.role === 'user'
      );

      const trimmedHistory =
        firstUserIndex === -1
          ? [] // user 메시지가 없다면 history를 비운다
          : conversationHistory.slice(firstUserIndex);

      const history = trimmedHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: history,
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        metadata: {
          model: 'gemini-3-flash-preview',
          finishReason: response.candidates?.[0]?.finishReason,
        },
      };
    } catch (error: any) {
      console.error('Error sending message to Gemini:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async analyzeConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    language: string
  ): Promise<any> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const analysisPrompt = `Analyze this career counseling conversation and provide a JSON analysis.

Conversation:
${conversationText}

Provide analysis in this JSON format:
{
  "interests": ["list of identified interests"],
  "strengths": ["list of strengths/talents"],
  "values": ["core values"],
  "learning_style": "visual/auditory/kinesthetic/mixed",
  "motivation_level": 1-10,
  "career_preferences": {
    "work_environment": "solo/team/outdoor/indoor/flexible",
    "interaction_level": "people-focused/task-focused/balanced",
    "creativity_vs_structure": "creative/structured/balanced"
  },
  "mental_health_flags": ["any concerns"],
  "unique_insights": "special notes"
}

Respond ONLY with valid JSON, no additional text.`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        safetySettings: this.getSafetySettings(),
      });

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text().trim();

      // Try to parse JSON (might need to extract from markdown code blocks)
      let jsonText = text;
      if (text.startsWith('```')) {
        jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('Error analyzing conversation:', error);
      throw new Error(`Analysis error: ${error.message}`);
    }
  }

  async generateGreeting(nickname: string, age: number, language: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    const languageMap: Record<string, string> = {
      ko: 'Korean',
      en: 'English',
      es: 'Spanish',
      ja: 'Japanese',
    };

    const langName = languageMap[language] || 'English';

    const exampleGreetings: Record<string, string> = {
      ko: `안녕 ${nickname}! 난 너의 패스파인더야. 너의 미래를 함께 탐험해볼까?`,
      en: `Hello ${nickname}! I'm your Pathfinder. Shall we explore your future together?`,
      es: `¡Hola ${nickname}! Soy tu Pathfinder. ¿Exploramos tu futuro juntos?`,
      ja: `こんにちは、${nickname}！私はあなたのパスファインダーです。一緒に未来を探検しましょうか？`,
    };

    const greetingPrompt = `You are a warm, supportive career counselor for teenagers. Your name is "Pathfinder"${language === 'ko' ? ' (패스파인더)' : ''}.

The user's name is "${nickname}" and they are ${age} years old.

Generate a friendly greeting in ${langName} ONLY. Do NOT include any other languages.

Example: "${exampleGreetings[language] || exampleGreetings.en}"

Keep it warm, friendly, and age-appropriate. Respond ONLY with the greeting message in ${langName}, nothing else.`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        safetySettings: this.getSafetySettings(),
      });

      const result = await model.generateContent(greetingPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.error('Error generating greeting:', error);
      // Fallback greeting
      if (language === 'ko') {
        return `안녕 ${nickname}! 난 너의 패스파인더야. 너의 미래를 함께 탐험해볼까?`;
      } else if (language === 'en') {
        return `Hello ${nickname}! I'm your Pathfinder. Shall we explore your future together?`;
      } else if (language === 'es') {
        return `¡Hola ${nickname}! Soy tu Pathfinder. ¿Exploramos tu futuro juntos?`;
      } else {
        return `こんにちは、${nickname}！私はあなたのパスファインダーです。一緒に未来を探検しましょうか？`;
      }
    }
  }

  async generateCareerRecommendations(
    profile: any,
    language: string
  ): Promise<Array<any>> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    const prompt = `Based on this user profile, suggest 3 diverse career paths:

Profile:
${JSON.stringify(profile, null, 2)}

For each career path, provide:
- Career name (in ${language})
- Brief description (2-3 sentences, teenager-friendly)
- Why it matches the user's profile
- Key skills needed
- Example jobs within this path
- Required education/qualifications
- Growth potential

Output format: JSON array with this structure:
[
  {
    "career_name": "...",
    "description": "...",
    "match_reason": "...",
    "skills_needed": ["..."],
    "example_jobs": ["..."],
    "education_path": "...",
    "growth_potential": "..."
  }
]

Respond ONLY with valid JSON array, no additional text.`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        safetySettings: this.getSafetySettings(),
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      let jsonText = text;
      if (text.startsWith('```')) {
        jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      throw new Error(`Recommendation error: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();


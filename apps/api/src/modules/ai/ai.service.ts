import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI features will use mock responses.');
    }
  }

  async explain(text: string, context?: string): Promise<{ explanation: string }> {
    if (!this.model) {
      return this.mockExplain(text, context);
    }

    try {
      const prompt = `
        You are an expert educational tutor.
        Explain the concept "${text}" simply and clearly for a student.
        ${context ? `Context: The student is learning from a lesson about: "${context}".` : ''}
        Keep the explanation concise (under 150 words) and easy to understand.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return { explanation: response.text() };
    } catch (error) {
      this.logger.error('Error generating explanation with Gemini', error);
      return this.mockExplain(text, context);
    }
  }

  async generateQuiz(topic: string, difficulty: string, count: number = 3): Promise<any> {
    if (!this.model) {
      return this.mockGenerateQuiz(topic, difficulty, count);
    }

    try {
      const prompt = `
        Generate a multiple-choice quiz about "${topic}".
        Difficulty: ${difficulty}.
        Number of questions: ${count}.
        
        Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
        {
          "questions": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0, // Index of correct option (0-3)
              "explanation": "Brief explanation of why this is correct"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up markdown if present
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.error('Error generating quiz with Gemini', error);
      return this.mockGenerateQuiz(topic, difficulty, count);
    }
  }

  // Mock fallbacks
  private async mockExplain(text: string, context?: string): Promise<{ explanation: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      explanation: `(Mock Mode - No API Key) Here is a simplified explanation for "${text}". \n\nThis concept relates to "${context || 'general knowledge'}". \n\nTo enable real AI, please add GEMINI_API_KEY to your .env file.` 
    };
  }

  private async mockGenerateQuiz(topic: string, difficulty: string, count: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      questions: Array.from({ length: count }).map((_, i) => ({
        question: `(Mock) Generated Question ${i + 1} about ${topic} (${difficulty})`,
        options: [
          `Option A for ${topic}`,
          `Option B for ${topic}`,
          `Option C for ${topic}`,
          `Option D for ${topic}`,
        ],
        correctAnswer: 0,
        explanation: `This is a mock response. Configure GEMINI_API_KEY for real questions.`
      }))
    };
  }
}

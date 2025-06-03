interface LLMResponse {
  content: string;
  fallacies?: string[];
  coaching?: string;
}

interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: HuggingFaceModel[] = [
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral-7B-Instruct',
    description: 'High-quality instruction-following model'
  },
  {
    id: 'microsoft/DialoGPT-medium',
    name: 'DialoGPT-Medium',
    description: 'Conversational AI model optimized for dialogue'
  },
  {
    id: 'HuggingFaceH4/zephyr-7b-beta',
    name: 'Zephyr-7B-Beta',
    description: 'Fine-tuned conversational model'
  }
];

export class LLMService {
  private static readonly FALLBACK_API_KEY = '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';
  private static readonly HF_API_BASE = 'https://api-inference.huggingface.co/models';

  private static getApiKey(): string {
    // Get API key from localStorage settings
    try {
      const settingsData = localStorage.getItem('debate_trainer_settings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        if (settings.llmApiKey) {
          console.log('Using API key from settings');
          return settings.llmApiKey;
        }
      }
    } catch (error) {
      console.warn('Failed to load API key from settings:', error);
    }
    
    console.log('Using fallback API key');
    return this.FALLBACK_API_KEY;
  }
  static async testConnection(modelId: string = 'mistralai/Mistral-7B-Instruct-v0.3'): Promise<boolean> {
    try {
      const apiKey = this.getApiKey();
      console.log(`Testing connection to ${modelId} with API key: ${apiKey.substring(0, 10)}...`);
      
      const response = await fetch(`${this.HF_API_BASE}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: "Hello, how are you?",
          parameters: {
            max_new_tokens: 20,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      });

      console.log(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        
        if (response.status === 503) {
          // Model is loading, which means it exists but needs time
          console.log('Model is loading, this is actually a good sign!');
          return true;
        }
        
        return false;
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
  static async generateDebateResponse(
    input: string,
    modelId: string = 'mistralai/Mistral-7B-Instruct-v0.3'
  ): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      console.log(`Generating response with model: ${modelId}`);
      console.log(`Input: ${input}`);
      console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
      
      const response = await fetch(`${this.HF_API_BASE}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        }),
      });

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        
        if (response.status === 503) {
          throw new Error('Model is currently loading. Please wait a moment and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key in Settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making another request.');
        } else if (response.status === 404) {
          throw new Error('Model not found. Please try a different model.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Raw API Response:', data);
      
      let content = '';
      
      if (Array.isArray(data) && data.length > 0) {
        if (data[0]?.generated_text) {
          content = data[0].generated_text.trim();
        } else if (typeof data[0] === 'string') {
          content = data[0].trim();
        }
      } else if (data.generated_text) {
        content = data.generated_text.trim();
      } else if (data.error) {
        throw new Error(`API Error: ${data.error}`);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format from API');
      }

      console.log('Generated content:', content);
      
      if (!content) {
        throw new Error('Empty response from API');
      }
      
      return content || "I understand your point. Let me offer a different perspective on this topic.";
    } catch (error) {
      console.error('Hugging Face API error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate response. Please try again.');
    }
  }
  static async generateCounterArgument(
    topic: string,
    userArgument: string,
    position: 'for' | 'against',
    modelId?: string,
    apiKey?: string
  ): Promise<LLMResponse> {
    const selectedModel = modelId || 'mistralai/Mistral-7B-Instruct-v0.3';
    const activeApiKey = apiKey || this.getApiKey();
    
    try {
      const prompt = this.createCounterArgumentPrompt(topic, userArgument, position);
      console.log('Generated prompt:', prompt);
      
      const response = await fetch(`${this.HF_API_BASE}/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeApiKey}`,
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        }),
      });

      console.log(`Counter-argument API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Counter-argument API Error: ${response.status} - ${errorText}`);
        
        // Fall back to mock response on API errors
        console.log('Falling back to mock response due to API error');
        return this.generateMockResponse(userArgument, position);
      }

      const data = await response.json();
      console.log('Counter-argument API Response:', data);
      
      let content = '';
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        content = data[0].generated_text.trim();
      } else if (data.generated_text) {
        content = data.generated_text.trim();
      } else {
        console.log('Unexpected response format, using mock response');
        return this.generateMockResponse(userArgument, position);
      }      // Clean up and validate the content
      if (!content || content.length < 10) {
        console.log('Generated content too short, using mock response');
        return this.generateMockResponse(userArgument, position);
      }
      
      // Inject fallacies based on chance (30% probability)
      const shouldIncludeFallacy = Math.random() < 0.3;
      const fallacies = shouldIncludeFallacy ? this.injectRandomFallacy() : [];

      return {
        content: this.ensureResponseLength(content),
        fallacies,
        coaching: this.generateCoaching(userArgument)
      };
    } catch (error) {
      console.error('Hugging Face API error:', error);
      console.log('Falling back to mock response due to error');
      return this.generateMockResponse(userArgument, position);
    }
  }
  static async generateFeedback(
    userAnswer: string,
    correctAnswer: string,
    apiKey?: string
  ): Promise<string> {
    const activeApiKey = apiKey || this.getApiKey();
    
    if (!activeApiKey) {
      return this.generateMockFeedback(userAnswer, correctAnswer);
    }

    try {
      const prompt = `<s>[INST] Provide brief coaching feedback for this fallacy identification:
User identified: ${userAnswer}
Correct answer: ${correctAnswer}
Give constructive feedback in 15-20 words: [/INST]`;

      const response = await fetch(`${this.HF_API_BASE}/mistralai/Mistral-7B-Instruct-v0.3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 40,
            temperature: 0.5,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        console.error('Feedback API error:', response.status);
        return this.generateMockFeedback(userAnswer, correctAnswer);
      }

      const data = await response.json();
      const feedback = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
      
      return feedback?.trim() || this.generateMockFeedback(userAnswer, correctAnswer);
    } catch (error) {
      console.error('Feedback generation error:', error);
      return this.generateMockFeedback(userAnswer, correctAnswer);
    }
  }  private static createCounterArgumentPrompt(
    topic: string,
    userArgument: string,
    position: 'for' | 'against'
  ): string {
    const oppositePosition = position === 'for' ? 'against' : 'for';
    return `<s>[INST] Debate topic: "${topic}"

User argues ${position}: "${userArgument}"

You argue ${oppositePosition}. Respond with exactly 1-2 short sentences (max 25 words). Be direct and persuasive. [/INST]`;
  }
  private static generateMockResponse(userArgument: string, position: 'for' | 'against'): LLMResponse {
    const mockResponses = {
      for: [
        "The economic data contradicts that assumption completely.",
        "Historical examples prove the opposite outcome occurs consistently.",
        "You're missing critical environmental factors in your analysis.",
        "That approach ignores fundamental human rights principles entirely."
      ],
      against: [
        "Recent studies overwhelmingly support this position with evidence.",
        "Your reasoning contains several logical gaps and inconsistencies.",
        "The long-term benefits clearly outweigh any short-term costs.",
        "This policy has succeeded in multiple countries already."
      ]
    };

    const responses = mockResponses[position === 'for' ? 'against' : 'for'];
    const content = responses[Math.floor(Math.random() * responses.length)];
    
    // 30% chance to include a fallacy
    const shouldIncludeFallacy = Math.random() < 0.3;
    const fallacies = shouldIncludeFallacy ? this.injectRandomFallacy() : [];

    return {
      content,
      fallacies,
      coaching: this.generateCoaching(userArgument)
    };
  }

  private static injectRandomFallacy(): string[] {
    const fallacyTypes = [
      'Ad Hominem',
      'Straw Man',
      'False Dilemma',
      'Slippery Slope',
      'Appeal to Authority',
      'Red Herring'
    ];
    
    return [fallacyTypes[Math.floor(Math.random() * fallacyTypes.length)]];
  }
  private static generateCoaching(userArgument: string): string {
    const coachingTips = [
      "Good point! Back it up with specific data.",
      "Strong argument. Address counterarguments to strengthen it.",
      "Well reasoned! Clarify the logical connections.",
      "Solid foundation. Avoid absolute statements without proof.",
      "Nice approach! Consider broader implications."
    ];

    return coachingTips[Math.floor(Math.random() * coachingTips.length)];
  }

  private static generateMockFeedback(userAnswer: string, correctAnswer: string): string {
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      return "Excellent identification! Your reasoning shows strong critical thinking skills.";
    } else {
      return `Good attempt! The correct answer was ${correctAnswer}. Review the argument structure.`;
    }
  }
  private static ensureResponseLength(content: string): string {
    const words = content.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + '...';
    }
    return content;
  }
}


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
    id: 'microsoft/DialoGPT-medium',
    name: 'DialoGPT-Medium',
    description: 'Conversational AI model optimized for dialogue'
  },
  {
    id: 'facebook/blenderbot-400M-distill',
    name: 'BlenderBot-400M',
    description: 'Conversational AI with good reasoning abilities'
  },
  {
    id: 'microsoft/DialoGPT-small',
    name: 'DialoGPT-Small',
    description: 'Smaller, faster conversational model'
  }
];

export class LLMService {
  private static readonly HF_API_KEY = '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';
  private static readonly HF_API_BASE = 'https://api-inference.huggingface.co/models';

  static async testConnection(modelId: string = 'microsoft/DialoGPT-medium'): Promise<boolean> {
    try {
      console.log(`Testing connection to ${modelId}...`);
      
      const response = await fetch(`${this.HF_API_BASE}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: "Hello",
          parameters: {
            max_length: 50,
            temperature: 0.7,
            pad_token_id: 50256
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
    modelId: string = 'microsoft/DialoGPT-medium'
  ): Promise<string> {
    try {
      console.log(`Generating response with model: ${modelId}`);
      console.log(`Input: ${input}`);
      
      const response = await fetch(`${this.HF_API_BASE}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            pad_token_id: 50256,
            do_sample: true
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
          throw new Error('Invalid API key. Please check your Hugging Face API key.');
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
      
      // Clean up the response if it's a dialogue model
      if (content.includes(input)) {
        content = content.replace(input, '').trim();
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
    const selectedModel = modelId || 'mistralai/Mistral-7B-Instruct-v0.2';
    
    try {
      const prompt = this.createCounterArgumentPrompt(topic, userArgument, position);
      
      const response = await fetch(`${this.HF_API_BASE}/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let content = '';
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        content = data[0].generated_text.trim();
      } else if (data.generated_text) {
        content = data.generated_text.trim();
      } else {
        throw new Error('Unexpected response format');
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
      return this.generateMockResponse(userArgument, position);
    }
  }

  static async generateFeedback(
    userAnswer: string,
    correctAnswer: string,
    apiKey?: string
  ): Promise<string> {
    if (!apiKey) {
      return this.generateMockFeedback(userAnswer, correctAnswer);
    }

    try {
      const prompt = `Provide brief coaching feedback for this fallacy identification:
User identified: ${userAnswer}
Correct answer: ${correctAnswer}
Give constructive feedback in 15-20 words:`;

      const response = await fetch(`${this.HF_API_BASE}/mistralai/Mistral-7B-Instruct-v0.2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 30,
            temperature: 0.5
          }
        }),
      });

      const data = await response.json();
      return data[0]?.generated_text?.replace(prompt, '').trim() || 
             this.generateMockFeedback(userAnswer, correctAnswer);
    } catch (error) {
      console.error('Feedback generation error:', error);
      return this.generateMockFeedback(userAnswer, correctAnswer);
    }
  }

  private static createCounterArgumentPrompt(
    topic: string,
    userArgument: string,
    position: 'for' | 'against'
  ): string {
    const oppositePosition = position === 'for' ? 'against' : 'for';
    return `Debate topic: ${topic}
You are arguing ${oppositePosition}. User said: "${userArgument}"
Provide a counter-argument (50-75 words, be persuasive but respectful):`;
  }

  private static generateMockResponse(userArgument: string, position: 'for' | 'against'): LLMResponse {
    const mockResponses = {
      for: [
        "That's interesting, but consider the broader economic implications of this approach.",
        "While I see your point, the evidence suggests a different conclusion entirely.",
        "Your argument overlooks key factors that significantly impact the outcome.",
        "That perspective ignores the fundamental principles underlying this issue completely."
      ],
      against: [
        "Actually, recent studies support the opposite view with compelling evidence.",
        "Your reasoning contains flaws that undermine the entire argument's validity.",
        "The benefits clearly outweigh any potential drawbacks you've mentioned here.",
        "Historical precedent shows that approach leads to unintended negative consequences."
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
      "Strong argument! Try backing it up with specific examples or data.",
      "Good point, but consider addressing potential counterarguments to strengthen your position.",
      "Well reasoned! You might want to clarify the logical connection between your premises.",
      "Solid foundation, but avoid absolute statements unless you have definitive proof.",
      "Nice approach! Consider the broader implications of your argument's conclusion."
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
    if (words.length > 20) {
      return words.slice(0, 20).join(' ') + '...';
    }
    return content;
  }
}

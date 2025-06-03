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
        // Fallacy detection disabled as requested
      return {
        content: this.ensureResponseLength(content),
        fallacies: [], // Fallacy alerts removed
        coaching: await this.generateSmartCoaching(userArgument, content)
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
    
    // Debater personalities - choose randomly for variety
    const debaterPersonalities = [
      {
        name: "Alex",
        style: "passionate and direct, uses strong evidence",
        trait: "I'm passionate about facts and love challenging ideas with solid evidence."
      },
      {
        name: "Sam",
        style: "analytical and methodical, breaks down arguments logically",
        trait: "I approach debates systematically, examining each part of your argument carefully."
      },
      {
        name: "Jordan",
        style: "witty and sharp, uses clever analogies",
        trait: "I enjoy finding creative angles and using analogies to make my points stick."
      }
    ];
    
    const personality = debaterPersonalities[Math.floor(Math.random() * debaterPersonalities.length)];
    
    return `<s>[INST] You are ${personality.name}, a skilled debater. ${personality.trait}

Topic: "${topic}"
User argues ${position}: "${userArgument}"

As ${personality.name}, argue ${oppositePosition} in your ${personality.style} style. Keep it to 1-2 punchy sentences (max 25 words). Show your personality! [/INST]`;
  }  private static generateMockResponse(userArgument: string, position: 'for' | 'against'): LLMResponse {
    // Personality-driven mock responses with distinct character voices
    const alexResponses = {
      for: [
        "Hold up! The data completely contradicts that claim.",
        "Actually, three major studies prove exactly the opposite.",
        "That ignores the environmental impact entirely.",
        "The human rights angle makes this a non-starter."
      ],
      against: [
        "The latest research backs this up 100%.",
        "Your argument has several logical gaps here.",
        "The economic benefits clearly outweigh the costs.",
        "Five countries already implemented this successfully."
      ]
    };

    const samResponses = {
      for: [
        "Let me break down why that logic doesn't hold.",
        "Systematically examining this, we see three flaws.",
        "The premise itself contains a fundamental error.",
        "Step by step analysis reveals the opposite."
      ],
      against: [
        "The evidence methodically supports this position.",
        "Breaking this down logically strengthens the case.",
        "Each component of this argument is solid.",
        "The systematic approach here is bulletproof."
      ]
    };

    const jordanResponses = {
      for: [
        "That's like saying umbrellas cause rain!",
        "Picture this: would you buy a car without wheels?",
        "It's the classic 'forest for the trees' mistake.",
        "This reminds me of rearranging deck chairs on the Titanic."
      ],
      against: [
        "Think of it like building a house on solid rock.",
        "It's the difference between a band-aid and surgery.",
        "This is chess while you're playing checkers.",
        "Like comparing a flashlight to the sun."
      ]
    };

    // Randomly choose a personality for variety
    const personalities = [
      { name: 'Alex', responses: alexResponses },
      { name: 'Sam', responses: samResponses },
      { name: 'Jordan', responses: jordanResponses }
    ];
    
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    const responses = personality.responses[position === 'for' ? 'against' : 'for'];
    const content = responses[Math.floor(Math.random() * responses.length)];
      // Fallacy detection disabled as requested
    const fallacies: string[] = []; // No fallacies

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
  }  private static async generateSmartCoaching(userArgument: string, aiResponse: string): Promise<string> {
    try {
      const activeApiKey = this.getApiKey();
      const prompt = `<s>[INST] You are Coach Maya, an encouraging debate coach who's been training champions for 15 years. You're supportive but direct, with a warm personality.

Student's argument: "${userArgument}"

As Coach Maya, give quick feedback in your encouraging style. Maximum 8 words, like you're whispering advice during a debate. Be personal and motivating! [/INST]`;

      const response = await fetch(`${this.HF_API_BASE}/mistralai/Mistral-7B-Instruct-v0.3`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 15,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        console.error('Smart coaching API error:', response.status);
        return this.generateCoaching(userArgument);
      }

      const data = await response.json();
      const coaching = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
      
      return coaching?.trim() || this.generateCoaching(userArgument);
    } catch (error) {
      console.error('Smart coaching generation error:', error);
      return this.generateCoaching(userArgument);
    }
  }  private static generateCoaching(userArgument: string): string {
    // Coach Maya's encouraging and varied feedback
    const coachingTips = [
      "Great start! Try adding some data.",
      "Nice point! Counter their objections next.",
      "Good logic! Connect it to real impact.",
      "Strong! Avoid absolutes like 'always' though.",
      "Love the passion! What's the evidence?",
      "Solid reasoning! Be more specific here.",
      "Excellent! Quote an expert to strengthen this.",
      "Smart approach! Anticipate their comeback.",
      "Perfect direction! Back it with numbers.",
      "Brilliant insight! Explain the consequences.",
      "You're onto something! Add a real example.",
      "Nice angle! Address the other side too.",
      "Good foundation! What's the bigger picture?",
      "Strong opener! How does this help people?",
      "Smart thinking! Make it more concrete.",
      "Excellent point! Why should they care?",
      "Great passion! Show them the proof.",
      "Nice logic! Connect to their values.",
      "Solid start! What happens if we don't?",
      "Perfect! Now make it unforgettable."
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

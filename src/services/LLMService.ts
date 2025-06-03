
interface LLMResponse {
  content: string;
  fallacies?: string[];
  coaching?: string;
}

export class LLMService {
  private static readonly API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

  static async generateCounterArgument(
    topic: string,
    userArgument: string,
    position: 'for' | 'against',
    apiKey?: string
  ): Promise<LLMResponse> {
    if (!apiKey) {
      return this.generateMockResponse(userArgument, position);
    }

    try {
      const prompt = this.createCounterArgumentPrompt(topic, userArgument, position);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data[0]?.generated_text?.replace(prompt, '').trim() || 'I disagree with your point.';
      
      // Inject fallacies based on chance (30% probability)
      const shouldIncludeFallacy = Math.random() < 0.3;
      const fallacies = shouldIncludeFallacy ? this.injectRandomFallacy() : [];

      return {
        content: this.ensureResponseLength(content),
        fallacies,
        coaching: this.generateCoaching(userArgument)
      };
    } catch (error) {
      console.error('LLM API error:', error);
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
Your counter-argument (15-20 words, be persuasive but argumentative):`;
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

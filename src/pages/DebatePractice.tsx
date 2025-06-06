
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, MessageSquare, User, Bot, Mic, MicOff } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { getRandomTopic, getPersonalizedTopic } from '../data/debateTopics';
import { DebateTopic, DebateMessage, DebateSession } from '../types';
import { LLMService } from '../services/LLMService';
import { StorageService } from '../services/StorageService';
import { toast } from '@/hooks/use-toast';
import AnimatedCoach from '../components/AnimatedCoach';

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

const DebatePractice: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateUserModel } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic | null>(null);
  const [userPosition, setUserPosition] = useState<'for' | 'against'>('for');
  const [currentSession, setCurrentSession] = useState<DebateSession | null>(null);  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicSelection, setShowTopicSelection] = useState(true);  const [coachingFeedback, setCoachingFeedback] = useState<string>('');
  const [coachPersonality, setCoachPersonality] = useState<'encouraging' | 'analytical' | 'friendly'>('encouraging');
  const [currentAIPersonality, setCurrentAIPersonality] = useState<string>('AI Debater');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  useEffect(() => {
    if (!selectedTopic) {
      loadRandomTopic();
    }
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setUserInput(prev => prev + finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Speech Recognition Error",
            description: "There was an issue with speech recognition. Please try again.",
            variant: "destructive"
          });
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const loadRandomTopic = () => {
    let topic: DebateTopic;
    
    if (settings.isPersonalized) {
      topic = getPersonalizedTopic(userModel.skillLevel);
    } else {
      topic = getRandomTopic();
    }
    
    setSelectedTopic(topic);
  };

  const startDebate = () => {
    if (!selectedTopic) return;

    const session: DebateSession = {
      id: `debate_${Date.now()}`,
      topic: selectedTopic,
      userPosition,
      messages: [],
      currentRound: 1,
      score: 0,
      completed: false,
      startTime: new Date().toISOString(),
      coherenceScore: 0,
      adaptivePrompts: []
    };

    setCurrentSession(session);
    setShowTopicSelection(false);
    
    // Add initial AI message
    const aiPosition = userPosition === 'for' ? 'against' : 'for';
    const initialMessage: DebateMessage = {
      id: `msg_${Date.now()}`,
      speaker: 'ai',
      content: `I'll be arguing ${aiPosition} ${selectedTopic.title.toLowerCase()}. Let's begin - please present your opening argument.`,
      round: 1,
      timestamp: new Date().toISOString()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [initialMessage]
    } : null);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !currentSession || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMessage: DebateMessage = {
      id: `msg_${Date.now()}_user`,
      speaker: 'user',
      content: userInput.trim(),
      round: currentSession.currentRound,
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    };

    setCurrentSession(updatedSession);
    setUserInput('');

    try {
      // Generate AI response
      const llmResponse = await LLMService.generateCounterArgument(
        currentSession.topic.title,
        userInput.trim(),
        userPosition,
        undefined,
        settings.llmApiKey
      );      // Add AI response
      const aiMessage: DebateMessage = {
        id: `msg_${Date.now()}_ai`,
        speaker: 'ai',
        content: llmResponse.content,
        round: currentSession.currentRound,
        timestamp: new Date().toISOString(),
        fallacies: llmResponse.fallacies,
        coaching: llmResponse.coaching
      };

      // Extract AI personality from response patterns
      const content = llmResponse.content.toLowerCase();
      if (content.includes('data') || content.includes('numbers') || content.includes('studies')) {
        setCurrentAIPersonality('Alex (Evidence-Based)');
      } else if (content.includes('break down') || content.includes('systematically') || content.includes('step')) {
        setCurrentAIPersonality('Sam (Analytical)');
      } else if (content.includes('like') || content.includes('think of') || content.includes('picture')) {
        setCurrentAIPersonality('Jordan (Creative)');
      } else {
        setCurrentAIPersonality('AI Debater');
      }

      const nextRound = currentSession.currentRound + 1;
      const isCompleted = nextRound > 5;

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        currentRound: nextRound,
        completed: isCompleted,
        endTime: isCompleted ? new Date().toISOString() : undefined,
        score: calculateScore(updatedSession.messages.length)
      };      setCurrentSession(finalSession);
      StorageService.saveDebateSession(finalSession);      // Set coaching feedback if available
      if (llmResponse.coaching) {
        setCoachingFeedback(llmResponse.coaching);
        
        // Dynamically adjust coach personality based on debate progress
        const round = currentSession.currentRound;
        if (round <= 2) {
          setCoachPersonality('encouraging'); // Early rounds: encouraging
        } else if (round <= 4) {
          setCoachPersonality('analytical'); // Mid rounds: analytical
        } else {
          setCoachPersonality('friendly'); // Final rounds: friendly
        }
      }

      if (isCompleted) {
        // Update user model
        updateUserModel({
          totalDebateCount: userModel.totalDebateCount + 1,
          lastPerformanceScore: finalSession.score / 100
        });

        toast({
          title: "Debate Complete!",
          description: `Great debate! Your score: ${finalSession.score}/100`,
        });
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = (messageCount: number): number => {
    // Simple scoring based on engagement and completion
    const baseScore = 60;
    const engagementBonus = Math.min(30, messageCount * 3);
    const completionBonus = currentSession?.completed ? 10 : 0;
    
    return Math.min(100, baseScore + engagementBonus + completionBonus);
  };
  const handleNewTopic = () => {
    setShowTopicSelection(true);
    setCurrentSession(null);
    setUserInput('');
    loadRandomTopic();
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your argument. Click the mic again to stop.",
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start speech recognition.",
          variant: "destructive"
        });
      }
    }
  };

  if (showTopicSelection && selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            
            <h1 className="text-3xl font-playfair font-bold text-white flex-1 text-center">
              AI Debate Practice
            </h1>
          </div>          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-playfair">
                  {selectedTopic.title}
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">
                  {selectedTopic.description}
                </p>
                <div className="flex justify-center mt-4">
                  <Badge variant="secondary">
                    Difficulty: {selectedTopic.difficulty}/5
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 text-center">Choose your position:</h3>
                  <div className="grid gap-4">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="position"
                        value="for"
                        checked={userPosition === 'for'}
                        onChange={(e) => setUserPosition(e.target.value as 'for')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="font-medium">For</p>
                        <p className="text-sm text-gray-600">{selectedTopic.forPosition}</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="position"
                        value="against"
                        checked={userPosition === 'against'}
                        onChange={(e) => setUserPosition(e.target.value as 'against')}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="font-medium">Against</p>
                        <p className="text-sm text-gray-600">{selectedTopic.againstPosition}</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={startDebate}
                    className="flex-1 bg-gradient-accent hover:opacity-90 text-white py-3"
                  >
                    Start Debate
                  </Button>
                  
                  <Button
                    onClick={handleNewTopic}
                    variant="outline"
                    className="px-6"
                  >
                    New Topic
                  </Button>
                </div>

                {settings.isPersonalized && (
                  <p className="text-sm text-center text-gray-600">
                    This topic is selected based on your skill level ({userModel.skillLevel}/5)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) return null;

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleNewTopic}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Topic
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-playfair font-bold text-white">
              {currentSession.topic.title}
            </h1>
            <p className="text-blue-100">
              Round {currentSession.currentRound}/5 • 
              You're arguing {userPosition} • 
              Score: {currentSession.score}/100
            </p>
          </div>

          <Badge variant="secondary" className="bg-white/20 text-white">
            {currentSession.completed ? 'Completed' : 'In Progress'}
          </Badge>
        </div>        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {/* Messages */}
              <Card className="bg-white/95 backdrop-blur-sm mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {currentSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.speaker === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.speaker === 'user' 
                            ? 'bg-blue-500' 
                            : 'bg-purple-500'
                        }`}>
                          {message.speaker === 'user' ? 
                            <User className="w-4 h-4 text-white" /> : 
                            <Bot className="w-4 h-4 text-white" />
                          }
                        </div>
                        
                        <div className={`flex-1 max-w-2xl ${
                          message.speaker === 'user' ? 'text-right' : ''
                        }`}>
                          {message.speaker === 'ai' && (
                            <div className="text-xs text-purple-600 font-medium mb-1">
                              {currentAIPersonality}
                            </div>
                          )}                          <div className={`inline-block p-4 rounded-lg ${
                            message.speaker === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-1">
                            Round {message.round}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="inline-block p-4 rounded-lg bg-gray-100 text-gray-800">
                            <p>Thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>              {/* Input */}
              {!currentSession.completed && (
                <Card className="bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Present your argument..."
                        className="flex-1 min-h-[100px]"
                        disabled={isLoading}
                      />
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={handleSendMessage}
                          disabled={!userInput.trim() || isLoading}
                          className="bg-gradient-secondary hover:opacity-90 text-white px-6"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        
                        {speechSupported && (
                          <Button
                            onClick={toggleSpeechRecognition}
                            disabled={isLoading}
                            variant={isListening ? "destructive" : "outline"}
                            className={`px-6 ${isListening ? 'animate-pulse' : ''}`}
                            title={isListening ? "Stop listening" : "Start speech-to-text"}
                          >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-600">
                        Round {currentSession.currentRound}/5 - Present your strongest arguments
                      </p>
                      {speechSupported && (
                        <p className="text-xs text-gray-500">
                          {isListening ? "🎤 Listening..." : "Click mic to use speech-to-text"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Completion Message */}
              {currentSession.completed && (
                <Card className="bg-white/95 backdrop-blur-sm border-l-4 border-green-500">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">Debate Complete!</h3>
                    <p className="text-gray-700 mb-4">
                      Final Score: {currentSession.score}/100
                    </p>
                    <Button
                      onClick={handleNewTopic}
                      className="bg-gradient-primary hover:opacity-90 text-white"
                    >
                      Start New Debate
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>            {/* Coaching Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/95 backdrop-blur-sm sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🎯 AI Coach
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-4">                    {/* Animated Coach Character */}
                    <AnimatedCoach 
                      isActive={!!coachingFeedback || isLoading}
                      message={coachingFeedback || (isLoading ? "Let me analyze your argument..." : undefined)}
                      personality={coachPersonality}
                    />
                      {/* Coaching Feedback Area */}
                    {coachingFeedback && (
                      <div className="w-full space-y-3">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-400 p-3 rounded-r">
                          <p className="text-sm text-purple-800 leading-relaxed font-medium">
                            💡 {coachingFeedback}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCoachingFeedback('')}
                          className="w-full text-xs hover:bg-purple-50"
                        >
                          Got it! ✨
                        </Button>
                      </div>
                    )}

                    {/* Coaching Tips */}
                    <div className="w-full bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">💪 Quick Tips</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Use specific examples</li>
                        <li>• Address counterarguments</li>
                        <li>• Support with evidence</li>
                        <li>• Stay logical and clear</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebatePractice;

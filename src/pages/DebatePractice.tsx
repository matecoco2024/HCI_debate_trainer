
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, MessageSquare, User, Bot } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { getRandomTopic, getPersonalizedTopic } from '../data/debateTopics';
import { DebateTopic, DebateMessage, DebateSession } from '../types';
import { LLMService } from '../services/LLMService';
import { StorageService } from '../services/StorageService';
import { toast } from '@/hooks/use-toast';
import LLMChat from '../components/LLMChat';

const DebatePractice: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateUserModel } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic | null>(null);
  const [userPosition, setUserPosition] = useState<'for' | 'against'>('for');
  const [currentSession, setCurrentSession] = useState<DebateSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicSelection, setShowTopicSelection] = useState(true);
  const [activeTab, setActiveTab] = useState('practice');

  useEffect(() => {
    if (!selectedTopic) {
      loadRandomTopic();
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
      startTime: new Date().toISOString()
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
      );

      // Add AI response
      const aiMessage: DebateMessage = {
        id: `msg_${Date.now()}_ai`,
        speaker: 'ai',
        content: llmResponse.content,
        round: currentSession.currentRound,
        timestamp: new Date().toISOString(),
        fallacies: llmResponse.fallacies,
        coaching: llmResponse.coaching
      };

      const nextRound = currentSession.currentRound + 1;
      const isCompleted = nextRound > 5;

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        currentRound: nextRound,
        completed: isCompleted,
        endTime: isCompleted ? new Date().toISOString() : undefined,
        score: calculateScore(updatedSession.messages.length)
      };

      setCurrentSession(finalSession);
      StorageService.saveDebateSession(finalSession);

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

      // Show coaching feedback if available
      if (llmResponse.coaching) {
        toast({
          title: "Coaching Tip",
          description: llmResponse.coaching,
          duration: 5000
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
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="practice">Structured Debate</TabsTrigger>
                <TabsTrigger value="chat">LLM Chat Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice">
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
              </TabsContent>
              
              <TabsContent value="chat">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
                  <LLMChat />
                </div>
              </TabsContent>
            </Tabs>
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
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Messages */}
          <Card className="bg-white/95 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.speaker === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.speaker === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                    }`}>
                      {message.speaker === 'user' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <Bot className="w-4 h-4 text-white" />
                      }
                    </div>
                    
                    <div className={`flex-1 ${
                      message.speaker === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-3 rounded-lg max-w-md ${
                        message.speaker === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{message.content}</p>
                        
                        {message.fallacies && message.fallacies.length > 0 && (
                          <div className="mt-2 text-xs opacity-75">
                            <p>⚠️ Potential fallacy: {message.fallacies.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Round {message.round}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input */}
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
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    className="bg-gradient-secondary hover:opacity-90 text-white px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  Round {currentSession.currentRound}/5 - Present your strongest arguments
                </p>
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
        </div>
      </div>
    </div>
  );
};

export default DebatePractice;

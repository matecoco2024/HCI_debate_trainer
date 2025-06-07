
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Clock, Send, Mic, MicOff, Play, Pause } from 'lucide-react';

interface SparringMessage {
  id: string;
  speaker: 'user' | 'ai';
  content: string;
  duration?: number;
  timestamp: string;
  stage: string;
}

interface SparringSession {
  topic: string;
  format: string;
  currentStage: number;
  timeRemaining: number;
  isUserTurn: boolean;
  messages: SparringMessage[];
  stages: Array<{
    name: string;
    duration: number;
    speaker: 'user' | 'ai';
    prompt: string;
  }>;
}

interface AISparringPartnerProps {
  topic: string;
  format: any;
  onComplete: (session: SparringSession) => void;
}

const AISparringPartner: React.FC<AISparringPartnerProps> = ({ 
  topic, 
  format, 
  onComplete 
}) => {
  const [session, setSession] = useState<SparringSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize session
  useEffect(() => {
    const stages = format.structure.map((stage: string, index: number) => ({
      name: stage,
      duration: stage.includes('Cross') ? 180 : stage.includes('Rebuttal') ? 240 : 360, // seconds
      speaker: index % 2 === 0 ? 'user' : 'ai',
      prompt: getStagePrompt(stage, index % 2 === 0 ? 'user' : 'ai')
    }));

    setSession({
      topic,
      format: format.name,
      currentStage: 0,
      timeRemaining: stages[0]?.duration || 360,
      isUserTurn: stages[0]?.speaker === 'user',
      messages: [],
      stages
    });
  }, [topic, format]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && session && session.timeRemaining > 0) {
      interval = setInterval(() => {
        setSession(prev => prev ? {
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, session?.timeRemaining]);

  const getStagePrompt = (stageName: string, speaker: string) => {
    if (speaker === 'user') {
      if (stageName.includes('Constructive')) {
        return 'Present your main arguments clearly and support them with evidence.';
      } else if (stageName.includes('Rebuttal')) {
        return 'Address your opponent\'s arguments and strengthen your position.';
      } else if (stageName.includes('Cross')) {
        return 'Ask strategic questions to expose weaknesses in your opponent\'s case.';
      }
      return 'Make your best argument for this stage.';
    } else {
      return 'AI will respond based on the debate context and format rules.';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);

  const handleSendSpeech = async () => {
    if (!userInput.trim() || !session) return;

    setIsProcessing(true);
    pauseTimer();

    // Add user message
    const userMessage: SparringMessage = {
      id: `msg_${Date.now()}_user`,
      speaker: 'user',
      content: userInput.trim(),
      duration: session.stages[session.currentStage].duration - session.timeRemaining,
      timestamp: new Date().toISOString(),
      stage: session.stages[session.currentStage].name
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage]
    };

    setSession(updatedSession);
    setUserInput('');

    // Simulate AI response (in real app, this would call LLM service)
    setTimeout(() => {
      const aiMessage: SparringMessage = {
        id: `msg_${Date.now()}_ai`,
        speaker: 'ai',
        content: generateAIResponse(userMessage.content, session.currentStage),
        timestamp: new Date().toISOString(),
        stage: session.stages[session.currentStage].name
      };

      const nextStage = session.currentStage + 1;
      const isComplete = nextStage >= session.stages.length;

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        currentStage: isComplete ? session.currentStage : nextStage,
        timeRemaining: isComplete ? 0 : session.stages[nextStage]?.duration || 0,
        isUserTurn: isComplete ? false : session.stages[nextStage]?.speaker === 'user'
      };

      setSession(finalSession);
      setIsProcessing(false);

      if (isComplete) {
        onComplete(finalSession);
      }
    }, 2000);
  };

  const generateAIResponse = (userContent: string, stageIndex: number): string => {
    // Mock AI response generation
    const responses = [
      `Thank you for that opening argument. However, I must respectfully disagree with your main premise. Let me present my counterpoint...`,
      `I appreciate your perspective, but I believe there are several flaws in your reasoning that I'd like to address...`,
      `While you make some valid points, I think you're overlooking crucial evidence that contradicts your position...`,
      `Your argument raises interesting questions, but I believe my position is stronger for the following reasons...`
    ];
    return responses[stageIndex % responses.length];
  };

  const nextStage = () => {
    if (!session) return;
    
    const nextStageIndex = session.currentStage + 1;
    if (nextStageIndex < session.stages.length) {
      setSession({
        ...session,
        currentStage: nextStageIndex,
        timeRemaining: session.stages[nextStageIndex].duration,
        isUserTurn: session.stages[nextStageIndex].speaker === 'user'
      });
    }
  };

  if (!session) return <div>Loading...</div>;

  const currentStage = session.stages[session.currentStage];
  const progress = ((session.currentStage + 1) / session.stages.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-playfair font-bold text-gray-800">
                AI Sparring Match
              </h2>
              <p className="text-gray-600">{session.topic}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {session.format}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Stage {session.currentStage + 1} of {session.stages.length}: {currentStage.name}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={`font-mono text-lg ${session.timeRemaining < 30 ? 'text-red-600' : 'text-gray-700'}`}>
                  {formatTime(session.timeRemaining)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Debate Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Debate Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.speaker === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {message.speaker === 'user' ? 
                        <User className="w-5 h-5 text-white" /> : 
                        <Bot className="w-5 h-5 text-white" />
                      }
                    </div>
                    
                    <div className={`flex-1 ${message.speaker === 'user' ? 'text-right' : ''}`}>
                      <div className="text-xs text-gray-500 mb-1">
                        {message.stage} {message.duration && `(${formatTime(message.duration)})`}
                      </div>
                      <div className={`inline-block p-4 rounded-lg max-w-lg ${
                        message.speaker === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-4 rounded-lg bg-gray-100 text-gray-800">
                        <p>AI is preparing response...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {session.isUserTurn && session.timeRemaining > 0 && (
                <div className="space-y-4">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={currentStage.prompt}
                    className="min-h-24"
                  />
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={isTimerRunning ? pauseTimer : startTimer}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isTimerRunning ? 'Pause' : 'Start'} Timer
                    </Button>
                    
                    <Button
                      onClick={() => setIsRecording(!isRecording)}
                      variant="outline"
                      className={`flex items-center gap-2 ${isRecording ? 'bg-red-50 border-red-200' : ''}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? 'Stop Recording' : 'Record Speech'}
                    </Button>
                    
                    <Button
                      onClick={handleSendSpeech}
                      disabled={!userInput.trim() || isProcessing}
                      className="bg-gradient-secondary hover:opacity-90 text-white flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Speech
                    </Button>
                  </div>
                </div>
              )}

              {!session.isUserTurn && session.timeRemaining > 0 && (
                <div className="text-center py-8 bg-purple-50 rounded-lg">
                  <Bot className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <p className="text-purple-700 font-medium">AI is preparing their argument...</p>
                  <p className="text-purple-600 text-sm">Listen carefully to respond effectively</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stage Guide */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Stage Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800 mb-2">
                  {currentStage.name}
                </h4>
                <p className="text-blue-700 text-sm">
                  {currentStage.prompt}
                </p>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Allocated Time:</span>
                  <span className="font-medium">{formatTime(currentStage.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Turn:</span>
                  <Badge variant={session.isUserTurn ? "default" : "secondary"}>
                    {session.isUserTurn ? "Yes" : "AI Speaking"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.stages.slice(session.currentStage + 1, session.currentStage + 4).map((stage, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{stage.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(stage.duration)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AISparringPartner;

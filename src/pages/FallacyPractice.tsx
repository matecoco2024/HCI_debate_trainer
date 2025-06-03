
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { getRandomFallacy, getPersonalizedFallacy } from '../data/fallacies';
import { FallacyExample } from '../types';
import { toast } from '@/hooks/use-toast';

const FallacyPractice: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateUserModel } = useUser();
  const [currentFallacy, setCurrentFallacy] = useState<FallacyExample | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [userExplanation, setUserExplanation] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadNewFallacy();
  }, []);

  const loadNewFallacy = () => {
    setStartTime(Date.now());
    let fallacy: FallacyExample;
    
    if (settings.isPersonalized) {
      const weakAreas = Object.entries(userModel.fallacyAccuracyHistory)
        .filter(([_, accuracy]) => accuracy < 0.7)
        .map(([type, _]) => type);
      
      fallacy = getPersonalizedFallacy(userModel.skillLevel, weakAreas);
    } else {
      fallacy = getRandomFallacy();
    }
    
    setCurrentFallacy(fallacy);
    setSelectedText('');
    setUserExplanation('');
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleSubmit = () => {
    if (!currentFallacy) return;

    const completionTime = (Date.now() - startTime) / 1000;
    const correct = currentFallacy.hasFallacy && selectedText.length > 0;
    
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update user model
    const newAccuracy = userModel.fallacyAccuracyHistory[currentFallacy.type] || 0;
    const updatedAccuracy = correct ? 
      Math.min(1, newAccuracy + 0.1) : 
      Math.max(0, newAccuracy - 0.05);

    const skillAdjustment = correct ? 0.02 : -0.01;
    const newSkillLevel = Math.max(1, Math.min(5, userModel.skillLevel + skillAdjustment));

    updateUserModel({
      skillLevel: newSkillLevel,
      fallacyAccuracyHistory: {
        ...userModel.fallacyAccuracyHistory,
        [currentFallacy.type]: updatedAccuracy
      },
      lastPerformanceScore: correct ? 1 : 0,
      totalPracticeCount: userModel.totalPracticeCount + 1
    });

    toast({
      title: correct ? "Correct!" : "Not quite right",
      description: correct ? 
        `Great job identifying the ${currentFallacy.type}!` : 
        `The correct answer was ${currentFallacy.type}`,
      variant: correct ? "default" : "destructive"
    });

    setSessionCount(prev => prev + 1);
  };

  const handleNext = () => {
    loadNewFallacy();
  };

  if (!currentFallacy) {
    return <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-playfair font-bold text-white">
              Fallacy Identification Practice
            </h1>
            <p className="text-blue-100 mt-2">
              Session {sessionCount + 1} • 
              {settings.isPersonalized ? ` Skill Level: ${userModel.skillLevel}/5` : ' Random Mode'}
            </p>
          </div>

          <Badge variant="secondary" className="bg-white/20 text-white">
            Difficulty: {currentFallacy.difficulty}/5
          </Badge>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8">
          {/* Main Content */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Read the argument below and identify any logical fallacies
              </CardTitle>
              <p className="text-gray-600">
                Select the text containing the fallacy, then explain your reasoning.
              </p>
            </CardHeader>
            <CardContent>
              <div 
                className="p-6 bg-gray-50 rounded-lg text-lg leading-relaxed cursor-text select-text"
                onMouseUp={handleTextSelection}
              >
                {currentFallacy.argument}
              </div>

              {selectedText && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm font-medium text-blue-800">Selected text:</p>
                  <p className="text-blue-700">"{selectedText}"</p>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Explain why this is a fallacy (optional):
                </label>
                <Textarea
                  value={userExplanation}
                  onChange={(e) => setUserExplanation(e.target.value)}
                  placeholder="Describe the logical error in this argument..."
                  className="min-h-[100px]"
                />
              </div>

              {!showFeedback && (
                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-secondary hover:opacity-90 text-white px-8"
                  >
                    Submit Answer
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Hint",
                        description: `Look for patterns of ${currentFallacy.type.toLowerCase()} in the argument.`,
                        duration: 3000
                      });
                    }}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Hint
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          {showFeedback && (
            <Card className={`bg-white/95 backdrop-blur-sm border-l-4 ${
              isCorrect ? 'border-green-500' : 'border-red-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isCorrect ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {isCorrect ? 'Correct!' : 'Not Quite Right'}
                    </h3>
                    
                    <p className="text-gray-700 mb-4">
                      <strong>Fallacy Type:</strong> {currentFallacy.type}
                    </p>
                    
                    <p className="text-gray-700 mb-4">
                      <strong>Explanation:</strong> {currentFallacy.explanation}
                    </p>

                    {settings.isPersonalized && (
                      <p className="text-sm text-blue-600 mb-4">
                        Your accuracy with {currentFallacy.type}: {
                          Math.round((userModel.fallacyAccuracyHistory[currentFallacy.type] || 0) * 100)
                        }%
                      </p>
                    )}

                    <Button
                      onClick={handleNext}
                      className="bg-gradient-primary hover:opacity-90 text-white"
                    >
                      Next Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FallacyPractice;

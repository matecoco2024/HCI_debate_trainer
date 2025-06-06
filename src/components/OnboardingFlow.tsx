
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mic, Users, Target } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { updateUserModel, updateSettings } = useUser();
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [micTested, setMicTested] = useState(false);

  const interestOptions = [
    { id: 'politics', label: 'Politics & Government', icon: '🏛️' },
    { id: 'ethics', label: 'Ethics & Philosophy', icon: '🤔' },
    { id: 'technology', label: 'Technology & AI', icon: '💻' },
    { id: 'environment', label: 'Environment & Climate', icon: '🌍' },
    { id: 'economics', label: 'Economics & Business', icon: '💼' },
    { id: 'social', label: 'Social Issues', icon: '👥' }
  ];

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicTested(true);
    } catch (error) {
      console.error('Microphone test failed:', error);
    }
  };

  const completeOnboarding = () => {
    updateUserModel({
      skillLevel,
      preferredTopics: interests,
      profileCompleted: true,
      badgesEarned: [],
      emotionalRatings: [],
      averageSpeechTime: 60,
      lastCoherenceScore: 50,
      fillerWordRate: 15
    });
    
    updateSettings({
      onboardingCompleted: true,
      microphoneEnabled: micTested
    });
    
    onComplete();
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-playfair">Welcome to AI Debate Practice!</CardTitle>
            <p className="text-gray-600 mt-4">
              Let's personalize your experience with a quick setup. This helps us provide better 
              debate topics and feedback tailored to your skill level.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  What's your current debate experience level?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSkillLevel(level)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        skillLevel === level 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{level}</div>
                      <div className="text-xs">
                        {level === 1 ? 'Beginner' : level === 5 ? 'Expert' : ''}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  1 = Complete beginner, 5 = Experienced debater
                </p>
              </div>
              
              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-gradient-secondary hover:opacity-90 text-white py-3"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-playfair">Choose Your Interests</CardTitle>
            <p className="text-gray-600">
              Select topics you're interested in debating. We'll use this to suggest relevant topics.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      interests.includes(option.id)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 bg-gradient-accent hover:opacity-90 text-white"
                  disabled={interests.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-playfair">Microphone Setup</CardTitle>
          <p className="text-gray-600">
            Optional: Test your microphone for speech-to-text functionality during debates.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              {!micTested ? (
                <div>
                  <Button 
                    onClick={testMicrophone}
                    variant="outline"
                    className="mb-4"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Test Microphone
                  </Button>
                  <p className="text-sm text-gray-500">
                    Click to test if your microphone is working
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span>Microphone test successful!</span>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 You're all set!</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Skill Level: {skillLevel}/5</li>
                <li>• Interests: {interests.join(', ')}</li>
                <li>• Microphone: {micTested ? 'Ready' : 'Skipped'}</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={completeOnboarding}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
              >
                Start Debating! 🚀
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;

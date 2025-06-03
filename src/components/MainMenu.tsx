
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Brain, MessageSquare, Settings2, BarChart3 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateSettings } = useUser();

  const handlePersonalizationToggle = (checked: boolean) => {
    updateSettings({ isPersonalized: checked });
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-playfair font-bold text-white mb-4">
            Critical Thinking Trainer
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Enhance your logical reasoning skills through AI-powered debate practice and fallacy identification training
          </p>
          
          {/* Personalization Toggle */}
          <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <span className="text-white font-medium">Random Content</span>
            <Switch
              checked={settings.isPersonalized}
              onCheckedChange={handlePersonalizationToggle}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-white font-medium">Personalized</span>
          </div>
          
          {settings.isPersonalized && (
            <div className="mt-4 text-blue-100">
              <p>Skill Level: {userModel.skillLevel}/5 • Practice Sessions: {userModel.totalPracticeCount}</p>
            </div>
          )}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Fallacy Practice */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-playfair text-gray-800">
                Fallacy Identification Practice
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sharpen your critical thinking by identifying logical fallacies in arguments
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-gradient-secondary hover:opacity-90 text-white font-semibold py-3"
                onClick={() => navigate('/practice')}
              >
                Start Practice Session
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                {settings.isPersonalized 
                  ? `Adaptive difficulty based on your skill level (${userModel.skillLevel}/5)`
                  : 'Random difficulty selection'
                }
              </p>
            </CardContent>
          </Card>

          {/* AI Debate */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-playfair text-gray-800">
                AI Debate Practice
              </CardTitle>
              <CardDescription className="text-gray-600">
                Engage in structured debates with AI coaching and real-time feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full bg-gradient-accent hover:opacity-90 text-white font-semibold py-3"
                onClick={() => navigate('/debate')}
              >
                Start Debate Session
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                {settings.isPersonalized 
                  ? `Personalized topics and coaching based on your history`
                  : 'Random topic selection'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 py-6"
            onClick={() => navigate('/settings')}
          >
            <Settings2 className="w-5 h-5 mr-2" />
            Settings & Study Mode
          </Button>
          
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 py-6"
            onClick={() => navigate('/analytics')}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Analytics
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-blue-100 text-sm">
          <p>HCI2025 Research Project - Personalized Learning Interface</p>
          <p className="mt-1">Version: {settings.isPersonalized ? 'Personalized' : 'Random'}</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;

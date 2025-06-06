
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Brain, MessageSquare, Settings2, BarChart3, ExternalLink } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import OnboardingFlow from './OnboardingFlow';
import ProgressDashboard from './ProgressDashboard';
import TopicRecommendations from './TopicRecommendations';
import FeedbackWidget from './FeedbackWidget';
import LoginForm from './LoginForm';
import { DebateTopic } from '../types';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, userModel, settings, isAuthenticated, isLoading, login, logout, updateSettings } = useUser();
  const [showDashboard, setShowDashboard] = useState(false);

  const handlePersonalizationToggle = (checked: boolean) => {
    updateSettings({ isPersonalized: checked });
  };

  const handleTopicSelect = (topic: DebateTopic) => {
    // Store selected topic and navigate to debate
    sessionStorage.setItem('selectedTopic', JSON.stringify(topic));
    navigate('/debate');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} isLoading={isLoading} />;
  }

  // Show onboarding if not completed
  if (!settings.onboardingCompleted) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          // Onboarding complete, will reload with main menu
        }} 
      />
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowDashboard(false)}
            >
              ← Back to Menu
            </Button>
            
            <h1 className="text-3xl font-playfair font-bold text-white">
              Your Progress Dashboard
            </h1>
            
            <div className="w-20" /> {/* Spacer */}
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
            <ProgressDashboard />
          </div>
        </div>
        <FeedbackWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <h1 className="text-5xl font-playfair font-bold text-white mb-4">
              Critical Thinking Trainer
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                onClick={logout}
                className="text-white hover:bg-white/20"
              >
                Logout ({user?.username})
              </Button>
            </div>
          </div>
          
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
              <p className="text-sm">Interests: {userModel.preferredTopics.join(', ')}</p>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Actions */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {/* Fallacy Practice */}
              <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-playfair text-gray-800">
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
                  <CardTitle className="text-xl font-playfair text-gray-800">
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

              {/* Progress Dashboard Card */}
              <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Your Progress
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDashboard(true)}
                      className="group-hover:bg-gray-100"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{userModel.totalDebateCount}</div>
                      <div className="text-sm text-gray-600">Debates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{userModel.lastCoherenceScore}</div>
                      <div className="text-sm text-gray-600">Last Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{userModel.badgesEarned?.length || 0}</div>
                      <div className="text-sm text-gray-600">Badges</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Topic Recommendations */}
              <TopicRecommendations onSelectTopic={handleTopicSelect} />

              {/* Quick Actions */}
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Settings & Study Mode
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Study Info */}
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">HCI2025 Research Project</p>
                    <p className="text-xs text-gray-500">
                      Version: {settings.isPersonalized ? 'Personalized' : 'Random'}
                    </p>
                    {settings.studyMode && (
                      <p className="text-xs text-blue-600 mt-1">
                        Study Mode Active
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <FeedbackWidget />
    </div>
  );
};

export default MainMenu;

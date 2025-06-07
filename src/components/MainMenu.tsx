
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Brain, MessageSquare, Settings2, BarChart3, ExternalLink } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import OnboardingFlow from './OnboardingFlow';
import EnhancedProgressDashboard from './EnhancedProgressDashboard';
import PracticeModeSelector from './PracticeModeSelector';
import TopicRecommendations from './TopicRecommendations';
import FeedbackWidget from './FeedbackWidget';
import { DebateTopic } from '../types';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateSettings } = useUser();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPracticeMode, setShowPracticeMode] = useState(false);

  const handlePersonalizationToggle = (checked: boolean) => {
    updateSettings({ isPersonalized: checked });
  };

  const handleTopicSelect = (topic: DebateTopic) => {
    // Store selected topic and navigate to debate
    sessionStorage.setItem('selectedTopic', JSON.stringify(topic));
    navigate('/debate');
  };

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
              Enhanced Progress Analytics
            </h1>
            
            <div className="w-20" /> {/* Spacer */}
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6">
            <EnhancedProgressDashboard />
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

              {/* Enhanced AI Debate */}
              <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-playfair text-gray-800">
                    AI Debate Practice
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose structured formats or free-form practice with AI sparring partners
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <Button 
                    className="w-full bg-gradient-accent hover:opacity-90 text-white font-semibold py-3"
                    onClick={() => setShowPracticeMode(true)}
                  >
                    Choose Practice Format
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/debate')}
                  >
                    Quick Debate Session
                  </Button>
                  <p className="text-sm text-gray-500">
                    New: Structured formats (Lincoln-Douglas, Public Forum) with AI coaching
                  </p>
                </CardContent>
              </Card>

              {/* Enhanced Progress Dashboard Card */}
              <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Advanced Progress Analytics
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
                  <CardDescription>
                    Deep insights into your debate performance with personalized improvement suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{userModel.totalDebateCount}</div>
                      <div className="text-sm text-gray-600">Debates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{userModel.lastCoherenceScore}</div>
                      <div className="text-sm text-gray-600">Coherence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{userModel.fillerWordRate}%</div>
                      <div className="text-sm text-gray-600">Filler Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{userModel.badgesEarned?.length || 0}</div>
                      <div className="text-sm text-gray-600">Badges</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800 font-medium">
                      🎯 Next Goal: Improve statistical evidence usage (+12% performance boost possible)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Topic Recommendations */}
              <TopicRecommendations onSelectTopic={handleTopicSelect} />

              {/* New Features Highlight */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ✨ New Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">🎯 AI Analysis Dashboard</h4>
                    <p className="text-xs text-gray-600">Get detailed feedback on fallacies, evidence, and argument structure</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">⚡ Practice Mode Formats</h4>
                    <p className="text-xs text-gray-600">Lincoln-Douglas, Public Forum, Parliamentary, and Oxford style debates</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">🤖 AI Sparring Partner</h4>
                    <p className="text-xs text-gray-600">Real-time turn-based practice with intelligent AI opponents</p>
                  </div>
                </CardContent>
              </Card>

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
      
      {/* Practice Mode Modal */}
      {showPracticeMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Select Practice Format</h2>
              <Button variant="ghost" onClick={() => setShowPracticeMode(false)}>×</Button>
            </div>
            <PracticeModeSelector 
              onFormatSelect={(format) => {
                setShowPracticeMode(false);
                // Handle format selection - could navigate to specialized practice page
                console.log('Selected format:', format);
              }}
            />
          </div>
        </div>
      )}
      
      <FeedbackWidget />
    </div>
  );
};

export default MainMenu;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings, updateSettings, resetUserData } = useUser();
  const [llmApiKey, setLlmApiKey] = useState(settings.llmApiKey || '');
  const [participantId, setParticipantId] = useState(settings.participantId || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    updateSettings({
      llmApiKey: llmApiKey.trim() || undefined,
      participantId: participantId.trim() || undefined
    });
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all user data? This cannot be undone.')) {
      resetUserData();
      setLlmApiKey('');
      setParticipantId('');
      
      toast({
        title: "Data Reset",
        description: "All user data has been cleared.",
        variant: "destructive"
      });
    }
  };

  const handleStudyModeToggle = (enabled: boolean) => {
    updateSettings({ studyMode: enabled });
    
    if (enabled) {
      toast({
        title: "Study Mode Enabled",
        description: "Data collection for research purposes is now active.",
      });
    }
  };

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
          
          <h1 className="text-3xl font-playfair font-bold text-white flex-1 text-center">
            Settings & Configuration
          </h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* LLM Configuration */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>LLM Integration</CardTitle>
              <p className="text-gray-600">
                Configure your Hugging Face API key for enhanced AI responses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Hugging Face API Key (Optional)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={llmApiKey}
                    onChange={(e) => setLlmApiKey(e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Without an API key, the app will use mock responses for demonstration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Mode Configuration */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Research Study Mode</CardTitle>
              <p className="text-gray-600">
                Enable data collection for HCI2025 research project
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Study Mode</Label>
                  <p className="text-sm text-gray-500">
                    Collect usability and emotional metrics for research
                  </p>
                </div>
                <Switch
                  checked={settings.studyMode}
                  onCheckedChange={handleStudyModeToggle}
                />
              </div>

              {settings.studyMode && (
                <div>
                  <Label htmlFor="participantId">Participant ID</Label>
                  <Input
                    id="participantId"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="P001"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Unique identifier for research data collection
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Model Status */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>User Model Status</CardTitle>
              <p className="text-gray-600">
                Current personalization data and performance metrics
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Skill Level</Label>
                  <p className="text-2xl font-bold text-blue-600">
                    {userModel.skillLevel}/5
                  </p>
                </div>
                
                <div>
                  <Label>Total Practice Sessions</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {userModel.totalPracticeCount}
                  </p>
                </div>
                
                <div>
                  <Label>Total Debates</Label>
                  <p className="text-2xl font-bold text-purple-600">
                    {userModel.totalDebateCount}
                  </p>
                </div>
                
                <div>
                  <Label>Last Performance</Label>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(userModel.lastPerformanceScore * 100)}%
                  </p>
                </div>
              </div>

              {Object.keys(userModel.fallacyAccuracyHistory).length > 0 && (
                <div>
                  <Label>Fallacy Type Accuracy</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(userModel.fallacyAccuracyHistory)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([type, accuracy]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm">{type}</span>
                          <span className="text-sm font-medium">
                            {Math.round(accuracy * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-secondary hover:opacity-90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            
            <Button
              onClick={handleReset}
              variant="destructive"
              className="px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Data
            </Button>
          </div>

          {/* Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                About This Research Project
              </h3>
              <p className="text-sm text-blue-700">
                This application is part of the HCI2025 research project studying the effectiveness 
                of personalized content adaptation in educational interfaces. The system compares 
                random content generation with personalized adaptation based on user performance data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

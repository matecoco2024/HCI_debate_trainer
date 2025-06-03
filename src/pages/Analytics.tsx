
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { StorageService } from '../services/StorageService';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { userModel, settings } = useUser();
  const debateSessions = StorageService.getDebateSessions();
  const studySessions = StorageService.getStudySessions();

  const calculateStats = () => {
    const completedDebates = debateSessions.filter(session => session.completed);
    const avgScore = completedDebates.length > 0 
      ? completedDebates.reduce((sum, session) => sum + session.score, 0) / completedDebates.length
      : 0;

    const recentSessions = debateSessions.slice(-5);
    const improvementTrend = recentSessions.length > 1 
      ? recentSessions[recentSessions.length - 1].score - recentSessions[0].score
      : 0;

    return {
      totalDebates: debateSessions.length,
      completedDebates: completedDebates.length,
      avgScore: Math.round(avgScore),
      improvementTrend: Math.round(improvementTrend),
      totalPractice: userModel.totalPracticeCount
    };
  };

  const stats = calculateStats();

  const getTopFallacyTypes = () => {
    return Object.entries(userModel.fallacyAccuracyHistory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getWeakAreas = () => {
    return Object.entries(userModel.fallacyAccuracyHistory)
      .filter(([_, accuracy]) => accuracy < 0.7)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);
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
            Performance Analytics
          </h1>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{userModel.skillLevel}/5</p>
                <p className="text-sm text-gray-600">Skill Level</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.totalPractice}</p>
                <p className="text-sm text-gray-600">Practice Sessions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.avgScore}%</p>
                <p className="text-sm text-gray-600">Avg Debate Score</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <p className={`text-2xl font-bold ${stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
                </p>
                <p className="text-sm text-gray-600">Recent Trend</p>
              </CardContent>
            </Card>
          </div>

          {/* Fallacy Performance */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Strong Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTopFallacyTypes().length > 0 ? (
                  <div className="space-y-3">
                    {getTopFallacyTypes().map(([type, accuracy]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="font-medium">{type}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {Math.round(accuracy * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Complete some practice sessions to see your strengths
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getWeakAreas().length > 0 ? (
                  <div className="space-y-3">
                    {getWeakAreas().map(([type, accuracy]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="font-medium">{type}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {Math.round(accuracy * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {getTopFallacyTypes().length > 0 
                      ? "Great job! No significant weak areas identified."
                      : "Complete some practice sessions to identify areas for improvement"
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Debate Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {debateSessions.length > 0 ? (
                <div className="space-y-4">
                  {debateSessions.slice(-5).reverse().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">{session.topic.title}</h3>
                        <p className="text-sm text-gray-600">
                          Position: {session.userPosition} • 
                          {session.completed ? ` Score: ${session.score}/100` : ' In Progress'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={session.completed ? "default" : "secondary"}
                          className={session.completed ? "bg-green-100 text-green-800" : ""}
                        >
                          {session.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No debate sessions yet. Start your first debate to see your activity here!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Study Data */}
          {settings.studyMode && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Research Study Data</CardTitle>
                <p className="text-gray-600">
                  Collected metrics for HCI2025 research project
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{studySessions.length}</p>
                    <p className="text-sm text-gray-600">Study Sessions</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {settings.participantId || 'Not Set'}
                    </p>
                    <p className="text-sm text-gray-600">Participant ID</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {settings.isPersonalized ? 'Personalized' : 'Random'}
                    </p>
                    <p className="text-sm text-gray-600">Current Mode</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                Personalized Recommendations
              </h3>
              
              {settings.isPersonalized ? (
                <div className="space-y-2 text-sm text-blue-700">
                  {userModel.skillLevel < 3 && (
                    <p>• Focus on fundamental fallacy types to build your foundation</p>
                  )}
                  
                  {getWeakAreas().length > 0 && (
                    <p>• Practice identifying {getWeakAreas()[0][0]} fallacies to improve weak areas</p>
                  )}
                  
                  {stats.totalPractice < 10 && (
                    <p>• Complete more practice sessions to unlock advanced personalization features</p>
                  )}
                  
                  {stats.avgScore > 0 && stats.avgScore < 70 && (
                    <p>• Work on argument structure and logical reasoning in debates</p>
                  )}
                  
                  {userModel.skillLevel >= 4 && (
                    <p>• Try advanced topics and complex fallacy types to challenge yourself</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-blue-700">
                  Enable personalized mode in settings to receive tailored recommendations based on your performance.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

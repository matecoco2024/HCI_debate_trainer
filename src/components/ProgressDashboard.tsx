
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Zap, Award, BarChart3 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const ProgressDashboard: React.FC = () => {
  const { userModel } = useUser();

  const recentSessions = 5; // Mock data for demo
  const coherenceProgress = [45, 52, 48, 65, 72]; // Last 5 sessions
  const avgImprovement = ((coherenceProgress[4] - coherenceProgress[0]) / coherenceProgress[0] * 100).toFixed(1);

  const badges = [
    { id: 'quick_thinker', name: 'Quick Thinker', icon: '⚡', earned: userModel.averageSpeechTime < 45 },
    { id: 'filler_beater', name: 'Filler Beater', icon: '🎯', earned: userModel.fillerWordRate < 5 },
    { id: 'consistent', name: 'Consistent Debater', icon: '📈', earned: userModel.totalDebateCount >= 5 },
    { id: 'evidence_master', name: 'Evidence Master', icon: '📊', earned: userModel.lastCoherenceScore > 80 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userModel.totalDebateCount}</div>
                <div className="text-sm text-blue-700">Total Debates</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userModel.lastCoherenceScore}/100</div>
                <div className="text-sm text-green-700">Last Coherence Score</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Coherence Trend (Last 5 Sessions)</span>
                <span className="text-green-600">+{avgImprovement}%</span>
              </div>
              <div className="flex items-end gap-1 h-20 bg-gray-50 p-2 rounded">
                {coherenceProgress.map((score, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 flex-1 rounded-sm"
                    style={{ height: `${score}%` }}
                    title={`Session ${i + 1}: ${score}/100`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Skills Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Debate Skills</span>
                <span>{userModel.skillLevel}/5</span>
              </div>
              <Progress value={userModel.skillLevel * 20} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Filler Words</span>
                <span>{userModel.fillerWordRate}%</span>
              </div>
              <Progress value={100 - userModel.fillerWordRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Lower is better</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Avg Speech Time</span>
                <span>{userModel.averageSpeechTime}s</span>
              </div>
              <Progress value={Math.min(userModel.averageSpeechTime / 90 * 100, 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Target: 60-90 seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-lg text-center transition-colors ${
                  badge.earned 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-gray-50 border border-gray-200 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { topic: 'AI in Healthcare', score: 72, time: '2 hours ago', improvement: '+8' },
              { topic: 'Climate Change Policy', score: 68, time: '1 day ago', improvement: '+3' },
              { topic: 'Remote Work Benefits', score: 65, time: '2 days ago', improvement: '-2' }
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{session.topic}</div>
                  <div className="text-sm text-gray-500">{session.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{session.score}/100</div>
                  <Badge 
                    variant={session.improvement.startsWith('+') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {session.improvement}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;

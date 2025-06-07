
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Zap, Brain, Clock, Award, BarChart3 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface DrillRecommendation {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'High' | 'Medium' | 'Low';
}

const EnhancedProgressDashboard: React.FC = () => {
  const { userModel } = useUser();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');

  // Mock enhanced analytics data
  const fallacyFrequencyData = [
    { type: 'Ad Hominem', count: 3, trend: -1 },
    { type: 'Straw Man', count: 2, trend: 0 },
    { type: 'False Dichotomy', count: 1, trend: -2 },
    { type: 'Appeal to Authority', count: 4, trend: 1 },
    { type: 'Slippery Slope', count: 2, trend: -1 }
  ];

  const speechClarityScores = [
    { date: '2024-01-01', clarity: 65, fillerWords: 12 },
    { date: '2024-01-08', clarity: 68, fillerWords: 10 },
    { date: '2024-01-15', clarity: 72, fillerWords: 8 },
    { date: '2024-01-22', clarity: 75, fillerWords: 6 },
    { date: '2024-01-29', clarity: 78, fillerWords: 5 }
  ];

  const argumentTypePerformance = [
    { type: 'Ethical Arguments', score: 82, sessions: 5 },
    { type: 'Statistical Evidence', score: 67, sessions: 8 },
    { type: 'Historical Precedent', score: 74, sessions: 3 },
    { type: 'Economic Impact', score: 59, sessions: 6 },
    { type: 'Social Implications', score: 88, sessions: 4 }
  ];

  const personalizedDrills: DrillRecommendation[] = [
    {
      id: 'drill-1',
      title: 'Statistical Evidence Workshop',
      description: 'Practice incorporating statistical data into your arguments effectively',
      targetSkill: 'Evidence Usage',
      estimatedTime: '15 minutes',
      difficulty: 'Medium',
      priority: 'High'
    },
    {
      id: 'drill-2',
      title: 'Filler Word Elimination',
      description: 'Reduce "um," "uh," and "like" through targeted speaking exercises',
      targetSkill: 'Speech Clarity',
      estimatedTime: '10 minutes',
      difficulty: 'Easy',
      priority: 'High'
    },
    {
      id: 'drill-3',
      title: 'Economic Argument Structure',
      description: 'Build stronger economic impact arguments with proper frameworks',
      targetSkill: 'Argument Types',
      estimatedTime: '20 minutes',
      difficulty: 'Hard',
      priority: 'Medium'
    },
    {
      id: 'drill-4',
      title: 'Counter-Argument Anticipation',
      description: 'Learn to predict and prepare for opponent responses',
      targetSkill: 'Strategic Thinking',
      estimatedTime: '25 minutes',
      difficulty: 'Hard',
      priority: 'Medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{userModel.lastCoherenceScore}/100</div>
            <div className="text-sm text-blue-600">Latest Coherence Score</div>
            <div className="flex items-center justify-center mt-2 text-xs">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600">+8 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-700">{userModel.fillerWordRate}%</div>
            <div className="text-sm text-green-600">Filler Word Rate</div>
            <div className="flex items-center justify-center mt-2 text-xs">
              <TrendingDown className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-green-600">-3% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-700">{userModel.averageSpeechTime}s</div>
            <div className="text-sm text-purple-600">Avg Speech Time</div>
            <div className="text-xs text-purple-500 mt-2">Target: 60-90s</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-700">{userModel.badgesEarned?.length || 0}</div>
            <div className="text-sm text-orange-600">Badges Earned</div>
            <div className="text-xs text-orange-500 mt-2">12 available</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fallacy Frequency Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Logical Fallacy Frequency
            </CardTitle>
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedTimeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(period)}
                  className="text-xs"
                >
                  {period === 'all' ? 'All Time' : `Last ${period}`}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fallacyFrequencyData.map((fallacy, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{fallacy.type}</span>
                      <span className="text-sm text-gray-600">{fallacy.count} times</span>
                    </div>
                    <Progress value={(fallacy.count / 5) * 100} className="h-2" />
                  </div>
                  <div className="ml-4 flex items-center">
                    {fallacy.trend > 0 && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {fallacy.trend < 0 && <TrendingDown className="w-4 h-4 text-green-500" />}
                    {fallacy.trend === 0 && <div className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Argument Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Argument Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {argumentTypePerformance.map((arg, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{arg.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{arg.score}%</span>
                      <Badge variant="outline" className="text-xs">
                        {arg.sessions} sessions
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={arg.score} 
                    className={`h-2 ${arg.score < 70 ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speech Clarity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Speech Clarity Improvement Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
            {speechClarityScores.map((score, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="text-xs text-gray-600">{score.clarity}%</div>
                <div 
                  className="bg-blue-500 w-8 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(score.clarity / 100) * 120}px` }}
                  title={`Clarity: ${score.clarity}%, Filler Words: ${score.fillerWords}`}
                />
                <div className="text-xs text-gray-500">
                  {new Date(score.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Practice Drills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Personalized Practice Drills
          </CardTitle>
          <p className="text-gray-600 text-sm">
            AI-recommended exercises based on your performance analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizedDrills.map((drill) => (
              <Card key={drill.id} className="border-l-4 border-blue-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{drill.title}</h4>
                    <Badge className={getPriorityColor(drill.priority)}>
                      {drill.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {drill.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {drill.estimatedTime}
                    </div>
                    <Badge className={getDifficultyColor(drill.difficulty)}>
                      {drill.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-secondary hover:opacity-90 text-white">
                      Start Drill
                    </Button>
                    <Button size="sm" variant="outline" className="px-3">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProgressDashboard;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, TrendingUp, Target, Brain, MessageSquare } from 'lucide-react';

interface AnalysisCard {
  id: string;
  type: 'fallacy' | 'evidence' | 'structure' | 'delivery';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  timestamp?: string;
}

interface AnalysisDashboardProps {
  speechText: string;
  analysisData: AnalysisCard[];
  onRetry?: () => void;
  onContinue?: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  speechText,
  analysisData,
  onRetry,
  onContinue
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <Target className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Brain className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fallacy': return <AlertTriangle className="w-4 h-4" />;
      case 'evidence': return <CheckCircle className="w-4 h-4" />;
      case 'structure': return <Target className="w-4 h-4" />;
      case 'delivery': return <MessageSquare className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-2">
          Speech Analysis Dashboard
        </h2>
        <p className="text-gray-600">
          AI-powered feedback on your debate performance
        </p>
      </div>

      {/* Overall Performance Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysisData.filter(item => item.type === 'fallacy' && item.severity === 'low').length}
              </div>
              <div className="text-sm text-blue-700">Logical Fallacies Avoided</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysisData.filter(item => item.type === 'evidence' && item.severity === 'low').length}
              </div>
              <div className="text-sm text-green-700">Strong Evidence Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysisData.filter(item => item.type === 'structure').length}
              </div>
              <div className="text-sm text-purple-700">Structure Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(0, 100 - (analysisData.filter(item => item.severity === 'high').length * 15))}%
              </div>
              <div className="text-sm text-orange-700">Overall Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysisData.map((card) => (
          <Card 
            key={card.id} 
            className={`${getSeverityColor(card.severity)} transition-all duration-200 hover:shadow-lg`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getTypeIcon(card.type)}
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(card.severity)}
                  <Badge variant="secondary" className="text-xs">
                    {card.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 mb-3 leading-relaxed">
                {card.description}
              </p>
              <div className="bg-white/80 rounded-lg p-3 border-l-4 border-blue-400">
                <p className="text-sm font-medium text-blue-800 mb-1">💡 Suggestion:</p>
                <p className="text-sm text-blue-700">
                  {card.suggestion}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Speech Transcript Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Your Speech Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4 border max-h-40 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {speechText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="px-6"
          >
            Practice Again
          </Button>
        )}
        {onContinue && (
          <Button 
            onClick={onContinue}
            className="bg-gradient-secondary hover:opacity-90 text-white px-8"
          >
            Continue Debate
          </Button>
        )}
        <Button 
          variant="outline"
          className="px-6"
        >
          Save Analysis
        </Button>
      </div>
    </div>
  );
};

export default AnalysisDashboard;

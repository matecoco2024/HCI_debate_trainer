
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { DebateTopic } from '../types';

interface TopicRecommendationsProps {
  onSelectTopic: (topic: DebateTopic) => void;
}

const TopicRecommendations: React.FC<TopicRecommendationsProps> = ({ onSelectTopic }) => {
  const { userModel, settings } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // Mock topic data - in real app this would come from an API
  const allTopics: DebateTopic[] = [
    {
      id: '1',
      title: 'AI should replace human doctors',
      description: 'Debate whether artificial intelligence can provide better medical care than human physicians.',
      difficulty: 4,
      forPosition: 'AI provides more accurate diagnoses and reduces human error',
      againstPosition: 'Human empathy and intuition are irreplaceable in healthcare',
      category: 'technology'
    },
    {
      id: '2',
      title: 'Universal Basic Income should be implemented',
      description: 'Discuss the merits of providing unconditional cash payments to all citizens.',
      difficulty: 3,
      forPosition: 'UBI reduces poverty and provides economic security',
      againstPosition: 'UBI is too expensive and reduces work incentives',
      category: 'economics'
    },
    {
      id: '3',
      title: 'Social media platforms should be regulated',
      description: 'Debate government oversight of social media companies.',
      difficulty: 2,
      forPosition: 'Regulation prevents misinformation and protects privacy',
      againstPosition: 'Regulation stifles free speech and innovation',
      category: 'politics'
    }
  ];

  const getPersonalizedTopics = (): DebateTopic[] => {
    if (!settings.isPersonalized) {
      return allTopics.slice(0, 3);
    }

    // Filter by user interests and adjust difficulty
    const userTopics = allTopics.filter(topic => 
      userModel.preferredTopics.includes(topic.category)
    );

    // Adjust difficulty based on skill level
    const skillAdjustedTopics = userTopics.filter(topic => 
      Math.abs(topic.difficulty - userModel.skillLevel) <= 1
    );

    return skillAdjustedTopics.length > 0 ? skillAdjustedTopics : allTopics.slice(0, 3);
  };

  const [recommendedTopics, setRecommendedTopics] = useState(getPersonalizedTopics());

  const refreshTopics = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRecommendedTopics(getPersonalizedTopics());
      setRefreshing(false);
    }, 1000);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      technology: '💻',
      economics: '💼',
      politics: '🏛️',
      ethics: '🤔',
      environment: '🌍',
      social: '👥'
    };
    return icons[category] || '💭';
  };

  const getRecommendationReason = (topic: DebateTopic) => {
    if (!settings.isPersonalized) return 'Random selection';
    
    if (userModel.preferredTopics.includes(topic.category)) {
      return `Matches your interest in ${topic.category}`;
    }
    if (Math.abs(topic.difficulty - userModel.skillLevel) === 0) {
      return 'Perfect difficulty match';
    }
    return 'Suggested for skill development';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            {settings.isPersonalized ? 'Recommended for You' : 'Topic of the Day'}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTopics}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {settings.isPersonalized && (
          <p className="text-sm text-gray-600">
            Based on your interests: {userModel.preferredTopics.join(', ')}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectTopic(topic)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(topic.category)}</span>
                  <h3 className="font-medium text-sm">{topic.title}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  Level {topic.difficulty}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">
                {topic.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Top Pick
                    </Badge>
                  )}
                  <span>{getRecommendationReason(topic)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  ~15 min
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => {
              // Navigate to full topic selection
              window.location.href = '/debate';
            }}
          >
            Browse All Topics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicRecommendations;

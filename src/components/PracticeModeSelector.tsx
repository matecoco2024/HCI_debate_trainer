
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, Zap } from 'lucide-react';

interface DebateFormat {
  id: string;
  name: string;
  description: string;
  duration: string;
  structure: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  participants: string;
  icon: React.ReactNode;
  features: string[];
}

interface PracticeModeSelectorProps {
  onFormatSelect: (format: DebateFormat) => void;
}

const PracticeModeSelector: React.FC<PracticeModeSelectorProps> = ({ onFormatSelect }) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const debateFormats: DebateFormat[] = [
    {
      id: 'lincoln-douglas',
      name: 'Lincoln-Douglas',
      description: 'One-on-one value debate focusing on philosophical and ethical issues',
      duration: '45 minutes',
      structure: [
        'Affirmative Constructive (6 min)',
        'Negative Cross-Examination (3 min)',
        'Negative Constructive (7 min)',
        'Affirmative Cross-Examination (3 min)',
        'Affirmative Rebuttal (4 min)',
        'Negative Rebuttal (6 min)',
        'Affirmative Rebuttal (3 min)'
      ],
      difficulty: 'Advanced',
      participants: '1v1',
      icon: <Target className="w-6 h-6" />,
      features: ['Value-based arguments', 'Cross-examination', 'Philosophical depth']
    },
    {
      id: 'public-forum',
      name: 'Public Forum',
      description: 'Team debate on current events and policy issues for general audiences',
      duration: '30 minutes',
      structure: [
        'Team A Constructive (4 min)',
        'Team B Constructive (4 min)',
        'Crossfire (3 min)',
        'Team A Rebuttal (4 min)',
        'Team B Rebuttal (4 min)',
        'Crossfire (3 min)',
        'Team A Summary (3 min)',
        'Team B Summary (3 min)',
        'Grand Crossfire (3 min)',
        'Team A Final Focus (2 min)',
        'Team B Final Focus (2 min)'
      ],
      difficulty: 'Intermediate',
      participants: '2v2',
      icon: <Users className="w-6 h-6" />,
      features: ['Current events', 'Accessible language', 'Team collaboration']
    },
    {
      id: 'parliamentary',
      name: 'Parliamentary',
      description: 'Quick preparation debate with impromptu topics and flexible structure',
      duration: '35 minutes',
      structure: [
        'Prime Minister Constructive (7 min)',
        'Leader of Opposition Constructive (8 min)',
        'Member of Government (8 min)',
        'Member of Opposition (8 min)',
        'Leader of Opposition Rebuttal (4 min)',
        'Prime Minister Rebuttal (5 min)'
      ],
      difficulty: 'Advanced',
      participants: '2v2',
      icon: <Zap className="w-6 h-6" />,
      features: ['15-minute prep time', 'Points of information', 'Impromptu topics']
    },
    {
      id: 'oxford',
      name: 'Oxford Style',
      description: 'Traditional formal debate with opening statements and rebuttals',
      duration: '60 minutes',
      structure: [
        'Opening Statement - Pro (6 min)',
        'Opening Statement - Con (6 min)',
        'First Rebuttal - Pro (4 min)',
        'First Rebuttal - Con (4 min)',
        'Second Rebuttal - Pro (4 min)',
        'Second Rebuttal - Con (4 min)',
        'Closing Statement - Con (5 min)',
        'Closing Statement - Pro (5 min)'
      ],
      difficulty: 'Beginner',
      participants: '1v1 or Teams',
      icon: <Clock className="w-6 h-6" />,
      features: ['Formal structure', 'Detailed arguments', 'Classic format']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-2">
          Choose Your Practice Format
        </h2>
        <p className="text-gray-600">
          Select a debate format to practice with structured timers and prompts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {debateFormats.map((format) => (
          <Card 
            key={format.id}
            className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
              selectedFormat === format.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedFormat(format.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {format.icon}
                  {format.name}
                </CardTitle>
                <Badge className={getDifficultyColor(format.difficulty)}>
                  {format.difficulty}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {format.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-600">{format.duration}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Participants:</span>
                  <p className="text-gray-600">{format.participants}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-2">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  {format.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-2">Structure Preview:</span>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <ol className="text-xs space-y-1">
                    {format.structure.slice(0, 4).map((stage, index) => (
                      <li key={index} className="text-gray-600">
                        {index + 1}. {stage}
                      </li>
                    ))}
                    {format.structure.length > 4 && (
                      <li className="text-gray-500 italic">
                        ...and {format.structure.length - 4} more stages
                      </li>
                    )}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFormat && (
        <div className="text-center">
          <Button 
            onClick={() => {
              const format = debateFormats.find(f => f.id === selectedFormat);
              if (format) onFormatSelect(format);
            }}
            className="bg-gradient-secondary hover:opacity-90 text-white px-8 py-3 text-lg"
          >
            Start {debateFormats.find(f => f.id === selectedFormat)?.name} Practice
          </Button>
        </div>
      )}
    </div>
  );
};

export default PracticeModeSelector;

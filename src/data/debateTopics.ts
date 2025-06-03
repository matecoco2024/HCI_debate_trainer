
import { DebateTopic } from '../types';

export const debateTopicsDatabase: DebateTopic[] = [
  // Difficulty Level 1 (Simple, clear-cut topics)
  {
    id: 'social-media-1',
    title: 'Social Media and Privacy',
    description: 'Should social media companies be required to protect user privacy more strictly?',
    difficulty: 1,
    forPosition: 'Companies should implement stricter privacy protections',
    againstPosition: 'Current privacy measures are sufficient for user protection'
  },
  {
    id: 'remote-work-1',
    title: 'Remote Work Policies',
    description: 'Should companies allow employees to work from home permanently?',
    difficulty: 1,
    forPosition: 'Permanent remote work should be standard option',
    againstPosition: 'In-office work is essential for productivity and collaboration'
  },

  // Difficulty Level 2 (Moderate complexity)
  {
    id: 'ai-education-2',
    title: 'AI in Education',
    description: 'Should artificial intelligence tools be integrated into classroom learning?',
    difficulty: 2,
    forPosition: 'AI tools enhance learning and prepare students for the future',
    againstPosition: 'AI tools reduce critical thinking and create dependency'
  },
  {
    id: 'universal-income-2',
    title: 'Universal Basic Income',
    description: 'Should governments implement a universal basic income program?',
    difficulty: 2,
    forPosition: 'UBI reduces poverty and provides economic security',
    againstPosition: 'UBI creates dependency and is economically unsustainable'
  },

  // Difficulty Level 3 (Complex topics)
  {
    id: 'gene-editing-3',
    title: 'Genetic Engineering Ethics',
    description: 'Should genetic editing be allowed for human enhancement beyond medical treatment?',
    difficulty: 3,
    forPosition: 'Genetic enhancement can improve human capabilities and quality of life',
    againstPosition: 'Genetic enhancement raises ethical concerns and increases inequality'
  },
  {
    id: 'space-exploration-3',
    title: 'Space Exploration Funding',
    description: 'Should governments prioritize space exploration over addressing earthly problems?',
    difficulty: 3,
    forPosition: 'Space exploration drives innovation and ensures human survival',
    againstPosition: 'Resources should focus on immediate terrestrial challenges'
  },

  // Difficulty Level 4 (Very complex)
  {
    id: 'consciousness-ai-4',
    title: 'AI Consciousness and Rights',
    description: 'If AI systems develop consciousness, should they be granted legal rights?',
    difficulty: 4,
    forPosition: 'Conscious AI deserves protection and rights like any sentient being',
    againstPosition: 'AI consciousness is uncertain and rights would create legal complications'
  },
  {
    id: 'democracy-tech-4',
    title: 'Democracy in the Digital Age',
    description: 'Should democratic participation be enhanced through digital technology and algorithms?',
    difficulty: 4,
    forPosition: 'Technology can make democracy more inclusive and informed',
    againstPosition: 'Digital democracy threatens traditional democratic values and privacy'
  },

  // Difficulty Level 5 (Expert level)
  {
    id: 'posthuman-ethics-5',
    title: 'Posthuman Transformation',
    description: 'Should humanity actively pursue technological enhancement to become posthuman?',
    difficulty: 5,
    forPosition: 'Posthuman enhancement is the natural next step in human evolution',
    againstPosition: 'Posthuman transformation threatens human identity and natural values'
  }
];

export const getTopicsByDifficulty = (difficulty: number): DebateTopic[] => {
  return debateTopicsDatabase.filter(topic => topic.difficulty === difficulty);
};

export const getRandomTopic = (maxDifficulty: number = 5): DebateTopic => {
  const suitableTopics = debateTopicsDatabase.filter(topic => topic.difficulty <= maxDifficulty);
  return suitableTopics[Math.floor(Math.random() * suitableTopics.length)];
};

export const getPersonalizedTopic = (userSkillLevel: number): DebateTopic => {
  // Target difficulty slightly above or at user skill level for appropriate challenge
  const targetDifficulty = Math.min(5, Math.max(1, userSkillLevel + Math.floor(Math.random() * 2)));
  const candidates = getTopicsByDifficulty(targetDifficulty);
  
  return candidates[Math.floor(Math.random() * candidates.length)];
};

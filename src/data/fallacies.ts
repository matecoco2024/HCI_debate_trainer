
import { FallacyExample } from '../types';

export const fallacyDatabase: FallacyExample[] = [
  // Difficulty Level 1 (Beginner)
  {
    id: 'ad-hominem-1',
    type: 'Ad Hominem',
    argument: "We shouldn't listen to John's argument about climate change because he's just a college dropout.",
    explanation: "This attacks John's character rather than addressing his actual argument about climate change.",
    difficulty: 1,
    hasFallacy: true,
    fallacyLocation: { start: 40, end: 85 }
  },
  {
    id: 'strawman-1',
    type: 'Straw Man',
    argument: "People who support renewable energy want to destroy all industry and send us back to the Stone Age.",
    explanation: "This misrepresents the renewable energy position, which doesn't advocate for destroying all industry.",
    difficulty: 1,
    hasFallacy: true,
    fallacyLocation: { start: 40, end: 95 }
  },
  {
    id: 'false-dilemma-1',
    type: 'False Dilemma',
    argument: "You're either with us completely or you're against us. There's no middle ground in this war.",
    explanation: "This presents only two options when there are likely more nuanced positions available.",
    difficulty: 1,
    hasFallacy: true,
    fallacyLocation: { start: 0, end: 50 }
  },

  // Difficulty Level 2 (Novice)
  {
    id: 'appeal-authority-2',
    type: 'Appeal to Authority',
    argument: "This investment strategy must be good because my wealthy neighbor recommended it to me.",
    explanation: "Being wealthy doesn't necessarily make someone an expert on investment strategies.",
    difficulty: 2,
    hasFallacy: true,
    fallacyLocation: { start: 55, end: 90 }
  },
  {
    id: 'slippery-slope-2',
    type: 'Slippery Slope',
    argument: "If we allow students to retake one exam, soon they'll expect to retake all exams, and eventually, grades will become meaningless.",
    explanation: "This assumes a chain of events without justification for why one change leads to extreme consequences.",
    difficulty: 2,
    hasFallacy: true,
    fallacyLocation: { start: 45, end: 130 }
  },

  // Difficulty Level 3 (Intermediate)
  {
    id: 'red-herring-3',
    type: 'Red Herring',
    argument: "While we're discussing the budget deficit, we should remember that our veterans have sacrificed so much for our freedom.",
    explanation: "This shifts the discussion away from the budget deficit to an unrelated topic about veterans.",
    difficulty: 3,
    hasFallacy: true,
    fallacyLocation: { start: 50, end: 120 }
  },
  {
    id: 'bandwagon-3',
    type: 'Bandwagon',
    argument: "Everyone's switching to this new social media platform, so it must be better than the alternatives.",
    explanation: "Popularity doesn't necessarily indicate quality or superiority.",
    difficulty: 3,
    hasFallacy: true,
    fallacyLocation: { start: 0, end: 85 }
  },

  // Difficulty Level 4 (Advanced)
  {
    id: 'equivocation-4',
    type: 'Equivocation',
    argument: "The sign said 'fine for parking here,' so I thought it was a good place to park and got a ticket.",
    explanation: "This uses 'fine' in two different meanings - 'good' and 'monetary penalty'.",
    difficulty: 4,
    hasFallacy: true,
    fallacyLocation: { start: 15, end: 45 }
  },
  {
    id: 'circular-reasoning-4',
    type: 'Circular Reasoning',
    argument: "We know the Bible is true because it says so in the Bible, and the Bible never lies.",
    explanation: "This uses the Bible's content to prove the Bible's truthfulness, which is circular logic.",
    difficulty: 4,
    hasFallacy: true,
    fallacyLocation: { start: 25, end: 80 }
  },

  // Difficulty Level 5 (Expert)
  {
    id: 'composition-5',
    type: 'Fallacy of Composition',
    argument: "Each player on the team is excellent, so the team must be excellent at working together.",
    explanation: "Individual excellence doesn't guarantee collective excellence or teamwork.",
    difficulty: 5,
    hasFallacy: true,
    fallacyLocation: { start: 40, end: 95 }
  },
  {
    id: 'no-fallacy-valid',
    type: 'No Fallacy',
    argument: "Studies show that regular exercise improves cardiovascular health, reduces stress, and increases longevity in most adults.",
    explanation: "This is a valid argument based on empirical evidence without logical fallacies.",
    difficulty: 3,
    hasFallacy: false
  }
];

export const getFallaciesByDifficulty = (difficulty: number): FallacyExample[] => {
  return fallacyDatabase.filter(fallacy => fallacy.difficulty === difficulty);
};

export const getRandomFallacy = (maxDifficulty: number = 5): FallacyExample => {
  const suitableFallacies = fallacyDatabase.filter(fallacy => fallacy.difficulty <= maxDifficulty);
  return suitableFallacies[Math.floor(Math.random() * suitableFallacies.length)];
};

export const getPersonalizedFallacy = (
  userSkillLevel: number,
  weakAreas: string[] = []
): FallacyExample => {
  // Adjust difficulty based on skill level but allow some challenge
  const targetDifficulty = Math.min(5, Math.max(1, userSkillLevel + Math.floor(Math.random() * 2) - 1));
  
  let candidates = getFallaciesByDifficulty(targetDifficulty);
  
  // If user has weak areas, prioritize those fallacy types
  if (weakAreas.length > 0) {
    const weakAreaCandidates = candidates.filter(fallacy => 
      weakAreas.includes(fallacy.type)
    );
    if (weakAreaCandidates.length > 0) {
      candidates = weakAreaCandidates;
    }
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
};

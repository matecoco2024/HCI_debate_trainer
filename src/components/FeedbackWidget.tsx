
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Star, Send, ThumbsUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { UserFeedback } from '../types';

const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feature, setFeature] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Please rate the tool",
        description: "Select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    const feedbackData: Omit<UserFeedback, 'id' | 'userId'> = {
      rating,
      feedback,
      feature,
      painPoint,
      timestamp: new Date().toISOString()
    };

    // In a real app, this would save to a database
    console.log('User feedback submitted:', feedbackData);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setIsOpen(false);
      setRating(0);
      setFeedback('');
      setFeature('');
      setPainPoint('');
      
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve the debate experience.",
      });
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg z-50"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Feedback
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Help Us Improve
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rate this tool (1-5 stars)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`p-1 transition-colors ${
                    value <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* What they liked most */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What did you like most?
            </label>
            <Textarea
              placeholder="e.g., The AI responses were realistic..."
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              className="h-20"
            />
          </div>

          {/* Biggest pain point */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What's the biggest pain point?
            </label>
            <Textarea
              placeholder="e.g., Hard to track my progress..."
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              className="h-20"
            />
          </div>

          {/* General feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Any other feedback?
            </label>
            <Textarea
              placeholder="Additional thoughts, suggestions..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="h-20"
            />
          </div>

          <Button
            onClick={submitFeedback}
            disabled={submitting || rating === 0}
            className="w-full bg-gradient-secondary hover:opacity-90 text-white"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Your feedback helps us create better debate training tools
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackWidget;

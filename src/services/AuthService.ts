
import { supabase } from '@/integrations/supabase/client';
import { UserModel } from '../types';

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export class AuthService {
  static async loginOrCreateUser(username: string): Promise<User | null> {
    try {
      // First, try to find existing user
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .single();

      if (existingUser && !findError) {
        console.log('User found, logging in:', existingUser);
        return existingUser;
      }

      // If user doesn't exist, create new user
      if (findError?.code === 'PGRST116') {
        console.log('Creating new user:', username);
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ username: username.toLowerCase().trim() }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return null;
        }

        // Create default user model for new user
        await this.createDefaultUserModel(newUser.id);
        return newUser;
      }

      console.error('Error finding user:', findError);
      return null;
    } catch (error) {
      console.error('Login/create error:', error);
      return null;
    }
  }

  static async createDefaultUserModel(userId: string): Promise<void> {
    try {
      const defaultModel = {
        user_id: userId,
        skill_level: 1,
        fallacy_accuracy_history: {},
        common_mistakes: [],
        last_performance_score: 0,
        total_practice_count: 0,
        total_debate_count: 0,
        preferred_topics: [],
        average_speech_time: 60,
        last_coherence_score: 50,
        filler_word_rate: 15,
        emotional_ratings: [],
        badges_earned: [],
        profile_completed: false
      };

      const { error } = await supabase
        .from('user_models')
        .insert([defaultModel]);

      if (error) {
        console.error('Error creating user model:', error);
      }
    } catch (error) {
      console.error('Error in createDefaultUserModel:', error);
    }
  }

  static async getUserModel(userId: string): Promise<UserModel | null> {
    try {
      const { data, error } = await supabase
        .from('user_models')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user model:', error);
        return null;
      }

      // Convert database format to UserModel format
      return {
        skillLevel: data.skill_level,
        fallacyAccuracyHistory: data.fallacy_accuracy_history || {},
        commonMistakes: data.common_mistakes || [],
        lastPerformanceScore: data.last_performance_score,
        totalPracticeCount: data.total_practice_count,
        totalDebateCount: data.total_debate_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        preferredTopics: data.preferred_topics || [],
        averageSpeechTime: data.average_speech_time,
        lastCoherenceScore: data.last_coherence_score,
        fillerWordRate: data.filler_word_rate,
        emotionalRatings: data.emotional_ratings || [],
        badgesEarned: data.badges_earned || [],
        profileCompleted: data.profile_completed
      };
    } catch (error) {
      console.error('Error in getUserModel:', error);
      return null;
    }
  }

  static async updateUserModel(userId: string, updates: Partial<UserModel>): Promise<boolean> {
    try {
      // Convert UserModel format to database format
      const dbUpdates = {
        skill_level: updates.skillLevel,
        fallacy_accuracy_history: updates.fallacyAccuracyHistory,
        common_mistakes: updates.commonMistakes,
        last_performance_score: updates.lastPerformanceScore,
        total_practice_count: updates.totalPracticeCount,
        total_debate_count: updates.totalDebateCount,
        preferred_topics: updates.preferredTopics,
        average_speech_time: updates.averageSpeechTime,
        last_coherence_score: updates.lastCoherenceScore,
        filler_word_rate: updates.fillerWordRate,
        emotional_ratings: updates.emotionalRatings,
        badges_earned: updates.badgesEarned,
        profile_completed: updates.profileCompleted,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(dbUpdates).filter(([_, value]) => value !== undefined)
      );

      const { error } = await supabase
        .from('user_models')
        .update(cleanUpdates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user model:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserModel:', error);
      return false;
    }
  }
}

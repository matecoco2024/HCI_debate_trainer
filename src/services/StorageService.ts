
import { UserModel, AppSettings, StudySession, DebateSession } from '../types';

export class StorageService {
  private static readonly USER_MODEL_KEY = 'debate_trainer_user_model';
  private static readonly SETTINGS_KEY = 'debate_trainer_settings';
  private static readonly STUDY_SESSIONS_KEY = 'debate_trainer_study_sessions';
  private static readonly DEBATE_SESSIONS_KEY = 'debate_trainer_debate_sessions';

  static saveUserModel(userModel: UserModel): void {
    try {
      localStorage.setItem(this.USER_MODEL_KEY, JSON.stringify(userModel));
    } catch (error) {
      console.error('Failed to save user model:', error);
    }
  }

  static getUserModel(): UserModel | null {
    try {
      const data = localStorage.getItem(this.USER_MODEL_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user model:', error);
      return null;
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getSettings(): AppSettings | null {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  static saveStudySession(session: StudySession): void {
    try {
      const sessions = this.getStudySessions();
      const updatedSessions = [...sessions, session];
      localStorage.setItem(this.STUDY_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save study session:', error);
    }
  }

  static getStudySessions(): StudySession[] {
    try {
      const data = localStorage.getItem(this.STUDY_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load study sessions:', error);
      return [];
    }
  }

  static saveDebateSession(session: DebateSession): void {
    try {
      const sessions = this.getDebateSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(this.DEBATE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save debate session:', error);
    }
  }

  static getDebateSessions(): DebateSession[] {
    try {
      const data = localStorage.getItem(this.DEBATE_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load debate sessions:', error);
      return [];
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(this.USER_MODEL_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.STUDY_SESSIONS_KEY);
      localStorage.removeItem(this.DEBATE_SESSIONS_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

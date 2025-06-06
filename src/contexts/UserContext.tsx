import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { UserModel, AppSettings } from '../types';
import { AuthService, User } from '../services/AuthService';

interface UserContextType {
  user: User | null;
  userModel: UserModel;
  settings: AppSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  updateUserModel: (updates: Partial<UserModel>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetUserData: () => void;
}

const defaultUserModel: UserModel = {
  skillLevel: 1,
  fallacyAccuracyHistory: {},
  commonMistakes: [],
  lastPerformanceScore: 0,
  totalPracticeCount: 0,
  totalDebateCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Enhanced user model fields
  preferredTopics: [],
  averageSpeechTime: 60,
  lastCoherenceScore: 50,
  fillerWordRate: 15,
  emotionalRatings: [],
  badgesEarned: [],
  profileCompleted: false
};

const defaultSettings: AppSettings = {
  isPersonalized: true,
  studyMode: false,
  onboardingCompleted: false,
  microphoneEnabled: false
};

interface UserState {
  user: User | null;
  userModel: UserModel;
  settings: AppSettings;
  isAuthenticated: boolean;
}

type UserAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_USER_MODEL'; payload: UserModel }
  | { type: 'UPDATE_USER_MODEL'; payload: Partial<UserModel> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'LOGOUT' }
  | { type: 'RESET_USER_DATA' };

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    case 'SET_USER_MODEL':
      return {
        ...state,
        userModel: action.payload
      };
    case 'UPDATE_USER_MODEL':
      const updatedUserModel = {
        ...state.userModel,
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
      return {
        ...state,
        userModel: updatedUserModel
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case 'LOGOUT':
      return {
        user: null,
        userModel: {
          ...defaultUserModel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        settings: defaultSettings,
        isAuthenticated: false
      };
    case 'RESET_USER_DATA':
      return {
        ...state,
        userModel: {
          ...defaultUserModel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        settings: defaultSettings
      };
    default:
      return state;
  }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    userModel: defaultUserModel,
    settings: defaultSettings,
    isAuthenticated: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string) => {
    setIsLoading(true);
    try {
      const user = await AuthService.loginOrCreateUser(username);
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        
        // Load user model from database
        const userModel = await AuthService.getUserModel(user.id);
        if (userModel) {
          dispatch({ type: 'SET_USER_MODEL', payload: userModel });
        }
        
        console.log('Successfully logged in:', user);
      } else {
        throw new Error('Failed to login or create user');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUserModel = async (updates: Partial<UserModel>) => {
    dispatch({ type: 'UPDATE_USER_MODEL', payload: updates });
    
    // Save to database if user is authenticated
    if (state.user) {
      await AuthService.updateUserModel(state.user.id, updates);
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  const resetUserData = async () => {
    dispatch({ type: 'RESET_USER_DATA' });
    
    // Reset in database if user is authenticated
    if (state.user) {
      await AuthService.updateUserModel(state.user.id, defaultUserModel);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        userModel: state.userModel,
        settings: state.settings,
        isAuthenticated: state.isAuthenticated,
        isLoading,
        login,
        logout,
        updateUserModel,
        updateSettings,
        resetUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

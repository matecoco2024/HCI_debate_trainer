
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserModel, AppSettings } from '../types';
import { StorageService } from '../services/StorageService';

interface UserContextType {
  userModel: UserModel;
  settings: AppSettings;
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
  updatedAt: new Date().toISOString()
};

const defaultSettings: AppSettings = {
  isPersonalized: true,
  studyMode: false
};

interface UserState {
  userModel: UserModel;
  settings: AppSettings;
}

type UserAction = 
  | { type: 'UPDATE_USER_MODEL'; payload: Partial<UserModel> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_USER_DATA' }
  | { type: 'LOAD_DATA'; payload: UserState };

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'UPDATE_USER_MODEL':
      return {
        ...state,
        userModel: {
          ...state.userModel,
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case 'RESET_USER_DATA':
      return {
        userModel: {
          ...defaultUserModel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        settings: defaultSettings
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    userModel: defaultUserModel,
    settings: defaultSettings
  });

  useEffect(() => {
    // Load saved data on initialization
    const savedUserModel = StorageService.getUserModel();
    const savedSettings = StorageService.getSettings();
    
    if (savedUserModel || savedSettings) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          userModel: savedUserModel || defaultUserModel,
          settings: savedSettings || defaultSettings
        }
      });
    }
  }, []);

  useEffect(() => {
    // Save data whenever state changes
    StorageService.saveUserModel(state.userModel);
    StorageService.saveSettings(state.settings);
  }, [state]);

  const updateUserModel = (updates: Partial<UserModel>) => {
    dispatch({ type: 'UPDATE_USER_MODEL', payload: updates });
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  const resetUserData = () => {
    dispatch({ type: 'RESET_USER_DATA' });
    StorageService.clearAll();
  };

  return (
    <UserContext.Provider
      value={{
        userModel: state.userModel,
        settings: state.settings,
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

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { User } from '../types';
import { loadState, saveState } from '../utils/storage';
import { MOCK_USER } from '../data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return state.user
        ? { user: { ...state.user, ...action.payload }, isAuthenticated: true }
        : state;
    default:
      return state;
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    authReducer,
    loadState<AuthState>('auth-storage', initialState),
  );

  useEffect(() => {
    saveState('auth-storage', state);
  }, [state]);

  const value = useMemo<AuthContextValue>(() => {
    const login = (email: string) => {
      if (email === MOCK_USER.email) {
        dispatch({ type: 'LOGIN', payload: MOCK_USER });
        return true;
      }
      return false;
    };

    const signup = (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      const user: User = {
        id: `user-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        notificationPrefs: {
          eventReminders: true,
          newEventsNearby: true,
          registrationUpdates: true,
        },
      };
      dispatch({ type: 'LOGIN', payload: user });
    };

    const logout = () => dispatch({ type: 'LOGOUT' });

    const updateUser = (updates: Partial<User>) => {
      dispatch({ type: 'UPDATE_USER', payload: updates });
    };

    return {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      login,
      signup,
      logout,
      updateUser,
    };
  }, [state.user, state.isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

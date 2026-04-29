import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { Notification } from '../types';
import { loadState, saveState } from '../utils/storage';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' };

const initialState: NotificationState = {
  notifications: MOCK_NOTIFICATIONS,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction,
): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      if (state.notifications.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return { notifications: [action.payload, ...state.notifications] };
    case 'MARK_READ':
      return {
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, read: true } : notif,
        ),
      };
    case 'MARK_ALL_READ':
      return {
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read: true,
        })),
      };
    default:
      return state;
  }
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    notificationReducer,
    loadState<NotificationState>('notif-storage', initialState),
  );

  useEffect(() => {
    saveState('notif-storage', state);
  }, [state]);

  const value = useMemo<NotificationContextValue>(() => {
    const addNotification = (notification: Notification) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    const markRead = (id: string) =>
      dispatch({ type: 'MARK_READ', payload: id });
    const markAllRead = () => dispatch({ type: 'MARK_ALL_READ' });
    const unreadCount = state.notifications.filter((n) => !n.read).length;

    return {
      notifications: state.notifications,
      addNotification,
      markRead,
      markAllRead,
      unreadCount,
    };
  }, [state.notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}

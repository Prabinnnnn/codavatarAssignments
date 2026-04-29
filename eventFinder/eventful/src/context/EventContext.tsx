import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { AppEvent, Registration } from '../types';
import { loadState, saveState } from '../utils/storage';
import { MOCK_EVENTS } from '../data/mockData';

interface EventState {
  events: AppEvent[];
  savedIds: string[];
  registrations: Registration[];
}

type EventAction =
  | { type: 'ADD_EVENT'; payload: AppEvent }
  | { type: 'UPDATE_EVENT'; payload: { id: string; updates: Partial<AppEvent> } }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'ADD_REGISTRATION'; payload: Registration }
  | { type: 'CANCEL_REGISTRATION'; payload: { eventId: string; userId: string } };

const initialState: EventState = {
  events: MOCK_EVENTS,
  savedIds: [MOCK_EVENTS[0].id, MOCK_EVENTS[1].id],
  registrations: [],
};

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.updates }
            : event,
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
        savedIds: state.savedIds.filter((id) => id !== action.payload),
      };
    case 'TOGGLE_SAVE':
      return state.savedIds.includes(action.payload)
        ? {
            ...state,
            savedIds: state.savedIds.filter((id) => id !== action.payload),
          }
        : { ...state, savedIds: [...state.savedIds, action.payload] };
    case 'ADD_REGISTRATION': {
      const updatedEvents = state.events.map((event) =>
        event.id === action.payload.eventId
          ? {
              ...event,
              attendees: [...event.attendees, action.payload.userId],
            }
          : event,
      );
      return {
        ...state,
        registrations: [...state.registrations, action.payload],
        events: updatedEvents,
      };
    }
    case 'CANCEL_REGISTRATION': {
      const updatedEvents = state.events.map((event) =>
        event.id === action.payload.eventId
          ? {
              ...event,
              attendees: event.attendees.filter(
                (id) => id !== action.payload.userId,
              ),
            }
          : event,
      );
      return {
        ...state,
        registrations: state.registrations.filter(
          (reg) =>
            reg.eventId !== action.payload.eventId ||
            reg.userId !== action.payload.userId,
        ),
        events: updatedEvents,
      };
    }
    default:
      return state;
  }
}

interface EventContextValue extends EventState {
  addEvent: (event: AppEvent) => void;
  updateEvent: (id: string, updates: Partial<AppEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleSave: (id: string) => void;
  addRegistration: (registration: Registration) => void;
  cancelRegistration: (eventId: string, userId: string) => void;
  isSaved: (eventId: string) => boolean;
  isRegistered: (eventId: string, userId: string) => boolean;
  getEventById: (id: string) => AppEvent | undefined;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    eventReducer,
    loadState<EventState>('event-storage', initialState),
  );

  useEffect(() => {
    saveState('event-storage', state);
  }, [state]);

  const value = useMemo<EventContextValue>(() => {
    const addEvent = (event: AppEvent) =>
      dispatch({ type: 'ADD_EVENT', payload: event });

    const updateEvent = (id: string, updates: Partial<AppEvent>) =>
      dispatch({ type: 'UPDATE_EVENT', payload: { id, updates } });

    const deleteEvent = (id: string) =>
      dispatch({ type: 'DELETE_EVENT', payload: id });

    const toggleSave = (id: string) =>
      dispatch({ type: 'TOGGLE_SAVE', payload: id });

    const addRegistration = (registration: Registration) =>
      dispatch({ type: 'ADD_REGISTRATION', payload: registration });

    const cancelRegistration = (eventId: string, userId: string) =>
      dispatch({ type: 'CANCEL_REGISTRATION', payload: { eventId, userId } });

    const isSaved = (eventId: string) => state.savedIds.includes(eventId);

    const isRegistered = (eventId: string, userId: string) => {
      const inRegistrations = state.registrations.some(
        (reg) => reg.eventId === eventId && reg.userId === userId,
      );
      const event = state.events.find((item) => item.id === eventId);
      return inRegistrations || (event ? event.attendees.includes(userId) : false);
    };

    const getEventById = (id: string) =>
      state.events.find((event) => event.id === id);

    return {
      ...state,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleSave,
      addRegistration,
      cancelRegistration,
      isSaved,
      isRegistered,
      getEventById,
    };
  }, [state]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvents must be used inside EventProvider');
  }
  return ctx;
}

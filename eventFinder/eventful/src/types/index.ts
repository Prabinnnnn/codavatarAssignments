export type EventCategory = 'All' | 'Tech' | 'Music' | 'Food' | 'Art' | 'Sports';
export type TicketType = 'free' | 'paid';
export type NotifType = 'reminder' | 'confirmation' | 'update' | 'nearby';
export type ViewMode = 'list' | 'map';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  notificationPrefs: {
    eventReminders: boolean;
    newEventsNearby: boolean;
    registrationUpdates: boolean;
  };
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
  category: Exclude<EventCategory, 'All'>;
  ticketType: TicketType;
  price?: number;
  currency?: string;
  capacity: number;
  attendees: string[];
  hostId: string;
  coverImage?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  subtitle: string;
  eventId: string;
  read: boolean;
  createdAt: string;
}

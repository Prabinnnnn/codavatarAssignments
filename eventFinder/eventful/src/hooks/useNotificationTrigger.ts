import { differenceInDays, format, parseISO } from 'date-fns';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useNotifications } from '../context/NotificationContext';

export function useNotificationTrigger() {
  const { user } = useAuth();
  const { events, registrations } = useEvents();
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    if (!user) {
      return;
    }

    registrations
      .filter((reg) => reg.userId === user.id)
      .forEach((reg) => {
        const event = events.find((item) => item.id === reg.eventId);
        if (!event) {
          return;
        }

        const daysUntil = differenceInDays(parseISO(event.date), new Date());
        if (daysUntil !== 1 && daysUntil !== 2) {
          return;
        }

        const hasReminder = notifications.some(
          (notif) => notif.type === 'reminder' && notif.eventId === event.id,
        );

        if (hasReminder) {
          return;
        }

        addNotification({
          id: `reminder-${event.id}`,
          type: 'reminder',
          title: `${event.title} is in ${daysUntil} day(s)!`,
          subtitle: `${format(parseISO(event.date), 'EEE d MMM')} - ${
            event.location
          } - ${event.time}`,
          eventId: event.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
  }, [user, events, registrations, notifications, addNotification]);
}

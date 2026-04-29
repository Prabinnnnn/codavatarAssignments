import {
  addDays,
  compareAsc,
  compareDesc,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { AppEvent, EventCategory } from '../types';

export type FilterState = {
  dateRange: 'all' | 'today' | 'this-week' | 'this-month';
  ticketType: 'all' | 'free' | 'paid';
  sortBy: 'date-asc' | 'date-desc' | 'popular';
};

export function useFilteredEvents(
  events: AppEvent[],
  searchQuery: string,
  category: EventCategory,
  filters: FilterState,
): AppEvent[] {
  const query = searchQuery.trim().toLowerCase();
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);

  const filtered = events.filter((event) => {
    const eventDate = startOfDay(parseISO(event.date));

    if (query) {
      const haystack = `${event.title} ${event.location} ${event.description}`
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (category !== 'All' && event.category !== category) {
      return false;
    }

    if (filters.dateRange === 'today' && !isSameDay(eventDate, today)) {
      return false;
    }

    if (filters.dateRange === 'this-week') {
      if (isBefore(eventDate, today) || isAfter(eventDate, weekEnd)) {
        return false;
      }
    }

    if (filters.dateRange === 'this-month') {
      if (isBefore(eventDate, today) || isAfter(eventDate, monthEnd)) {
        return false;
      }
    }

    if (filters.ticketType !== 'all' && event.ticketType !== filters.ticketType) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    const aDate = parseISO(`${a.date}T${a.time}`);
    const bDate = parseISO(`${b.date}T${b.time}`);

    if (filters.sortBy === 'date-desc') {
      return compareDesc(aDate, bDate);
    }

    if (filters.sortBy === 'popular') {
      return b.attendees.length - a.attendees.length;
    }

    return compareAsc(aDate, bDate);
  });
}

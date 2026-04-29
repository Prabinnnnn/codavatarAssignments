import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryPills } from '../components/CategoryPills';
import { EventCard } from '../components/EventCard';
import { EventMap } from '../components/EventMap';
import { FilterBar } from '../components/FilterBar';
import { NotificationBell } from '../components/NotificationBell';
import { SearchBar } from '../components/SearchBar';
import { ViewToggle } from '../components/ViewToggle';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useFilteredEvents } from '../hooks/useFilteredEvents';
import type { FilterState } from '../hooks/useFilteredEvents';
import type { AppEvent, EventCategory, ViewMode } from '../types';

export function LandingPage() {
  const { events } = useEvents();
  const { isAuthenticated, user } = useAuth();

  const [category, setCategory] = useState<EventCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    ticketType: 'all',
    sortBy: 'date-asc',
  });

  const filteredEvents = useFilteredEvents(
    events,
    searchQuery,
    category,
    filters,
  );

  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const displayEvents = useMemo(
    () => (filteredEvents.length ? filteredEvents : []),
    [filteredEvents],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#185FA5] text-white">
              E
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Eventful</p>
              <p className="text-xs text-slate-500">Find your next event</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <NotificationBell />
            {isAuthenticated && (
              <Link
                to="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F1FB] text-sm font-semibold text-[#185FA5]"
              >
                {user
                  ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
                  : 'U'}
              </Link>
            )}
            {!isAuthenticated && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm text-slate-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-[#E6F1FB] px-3 py-1 text-xs font-semibold text-[#185FA5]">
              Kathmandu events curated for you
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Discover events happening near you
            </h1>
            <p className="text-sm text-slate-600">
              Browse gatherings, workshops, and festivals across Kathmandu. Save
              the ones you love and register in seconds.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={isAuthenticated ? '/home' : '/signup'}
                className="inline-flex items-center gap-2 rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#discover"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Explore events
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-sm font-semibold text-slate-700">
              Upcoming highlights
            </h3>
            <div className="mt-4 space-y-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event.date} - {event.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Discover events
            </h2>
            <p className="text-sm text-slate-500">
              Search by category, date, or ticket type.
            </p>
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <div className="mt-6 grid gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by event, venue, or vibe"
          />
          <CategoryPills selected={category} onChange={setCategory} />
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {viewMode === 'map' ? (
          <div className="mt-8 space-y-6">
            <EventMap
              events={displayEvents}
              onMarkerClick={setSelectedEvent}
              className="h-64 w-full md:h-[420px]"
            />
            {selectedEvent && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedEvent.location} - {selectedEvent.time}
                </p>
                <Link
                  to={`/events/${selectedEvent.id}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#185FA5]"
                >
                  View details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {displayEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No events match your filters yet.
              </div>
            )}
            {displayEvents.map((event) => (
              <EventCard key={event.id} event={event} viewMode="list" />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500">
          <span>Eventful 2026. All rights reserved.</span>
          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-[#185FA5]">
                Login
              </Link>
              <Link to="/signup" className="hover:text-[#185FA5]">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { CategoryPills } from '../components/CategoryPills';
import { EventCard } from '../components/EventCard';
import { EventMap } from '../components/EventMap';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { TopNav } from '../components/TopNav';
import { ViewToggle } from '../components/ViewToggle';
import { useEvents } from '../context/EventContext';
import { useFilteredEvents } from '../hooks/useFilteredEvents';
import type { FilterState } from '../hooks/useFilteredEvents';
import type { AppEvent, EventCategory, ViewMode } from '../types';

export function HomePage() {
  const { events } = useEvents();
  const navigate = useNavigate();

  const [category, setCategory] = useState<EventCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    ticketType: 'all',
    sortBy: 'date-asc',
  });
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const filteredEvents = useFilteredEvents(
    events,
    searchQuery,
    category,
    filters,
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <TopNav title="Home" showBell showAvatar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Discover events
            </h1>
            <p className="text-sm text-slate-500">
              Find gatherings based on your interests.
            </p>
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <div className="mt-6 grid gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or location"
          />
          <CategoryPills selected={category} onChange={setCategory} />
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {viewMode === 'map' ? (
          <div className="mt-8 space-y-6">
            <EventMap
              events={filteredEvents}
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
                <button
                  onClick={() => navigate(`/events/${selectedEvent.id}`)}
                  className="mt-3 text-sm font-semibold text-[#185FA5]"
                >
                  View details
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {filteredEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No events match your filters yet.
              </div>
            )}
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} viewMode="list" />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/events/create')}
        className="fixed bottom-20 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#185FA5] text-white shadow-lg md:bottom-6"
        aria-label="Create event"
      >
        <Plus className="h-5 w-5" />
      </button>

      <BottomNav active="home" />
    </div>
  );
}

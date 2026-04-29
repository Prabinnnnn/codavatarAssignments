import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { CategoryPills } from '../components/CategoryPills';
import { EventMap } from '../components/EventMap';
import { SaveButton } from '../components/SaveButton';
import { SearchBar } from '../components/SearchBar';
import { TopNav } from '../components/TopNav';
import { useEvents } from '../context/EventContext';
import type { AppEvent, EventCategory } from '../types';

export function MapPage() {
  const { events } = useEvents();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<EventCategory>('All');
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (category !== 'All' && event.category !== category) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${event.title} ${event.location} ${event.description}`
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [events, searchQuery, category]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <TopNav title="Map" showBell showAvatar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events"
          />
          <CategoryPills selected={category} onChange={setCategory} />
        </div>

        <div className="mt-6">
          <EventMap
            events={filteredEvents}
            onMarkerClick={setSelectedEvent}
            className="h-[420px] w-full md:h-[calc(100vh-200px)]"
          />
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto max-w-6xl px-4 md:bottom-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedEvent.date} - {selectedEvent.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-[#E6F1FB] px-3 py-1 text-xs font-semibold text-[#185FA5]">
                {selectedEvent.ticketType === 'free'
                  ? 'Free'
                  : `NPR ${selectedEvent.price ?? 0}`}
              </span>
              <div className="flex items-center gap-2">
                <SaveButton eventId={selectedEvent.id} />
                <button
                  onClick={() => navigate(`/events/${selectedEvent.id}`)}
                  className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="map" />
    </div>
  );
}

import { Bookmark } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { EventCard } from '../components/EventCard';
import { TopNav } from '../components/TopNav';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';

export function SavedPage() {
  const { events, savedIds, toggleSave } = useEvents();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'all' | 'upcoming' | 'past'>('all');

  const savedEvents = useMemo(
    () => events.filter((event) => savedIds.includes(event.id)),
    [events, savedIds],
  );

  const filtered = useMemo(() => {
    if (tab === 'all') {
      return savedEvents;
    }
    const today = new Date().toISOString().slice(0, 10);
    return savedEvents.filter((event) =>
      tab === 'upcoming' ? event.date >= today : event.date < today,
    );
  }, [savedEvents, tab]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <TopNav title="Saved" showBell showAvatar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-3">
          {['all', 'upcoming', 'past'].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item as typeof tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tab === item
                  ? 'bg-[#185FA5] text-white'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {item === 'all' ? 'All' : item === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F1FB] text-[#185FA5]">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No saved events yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Save an event and it will appear here.
            </p>
            <Link
              to="/home"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
            >
              Discover
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <div key={event.id} className="group">
                <EventCard event={event} viewMode="grid" />
                <button
                  onClick={() => {
                    toggleSave(event.id);
                    showToast('Removed from saved', 'info');
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="saved" />
    </div>
  );
}

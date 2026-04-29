import { CalendarDays, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { EventCard } from '../components/EventCard';
import { TopNav } from '../components/TopNav';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';

export function ProfilePage() {
  const { user } = useAuth();
  const { events, savedIds, isRegistered } = useEvents();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'attending' | 'hosting' | 'past'>('attending');

  if (!user) {
    return null;
  }

  const hostingEvents = events.filter((event) => event.hostId === user.id);
  const attendingEvents = events.filter((event) =>
    isRegistered(event.id, user.id),
  );
  const today = new Date().toISOString().slice(0, 10);

  const tabEvents = useMemo(() => {
    if (tab === 'hosting') {
      return hostingEvents;
    }
    if (tab === 'past') {
      return attendingEvents.filter((event) => event.date < today);
    }
    return attendingEvents.filter((event) => event.date >= today);
  }, [tab, hostingEvents, attendingEvents, today]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <TopNav
        title="Profile"
        showBell
        rightAction={
          <button
            onClick={() => navigate('/profile/edit')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Edit
          </button>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F1FB] text-lg font-semibold text-[#185FA5]">
              {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              {user.location && (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
          {user.bio && (
            <p className="mt-4 text-sm text-slate-600">{user.bio}</p>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-semibold text-slate-900">
                {attendingEvents.length}
              </p>
              <p className="text-xs text-slate-500">Attending</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-semibold text-slate-900">
                {hostingEvents.length}
              </p>
              <p className="text-xs text-slate-500">Hosting</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xl font-semibold text-slate-900">
                {savedIds.length}
              </p>
              <p className="text-xs text-slate-500">Saved</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {['attending', 'hosting', 'past'].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item as typeof tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tab === item
                  ? 'bg-[#185FA5] text-white'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {item === 'attending'
                ? 'Attending'
                : item === 'hosting'
                  ? 'Hosting'
                  : 'Past'}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {tabEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">
                No events in this section yet.
              </p>
            </div>
          ) : (
            tabEvents.map((event) => (
              <div key={event.id} className="space-y-2">
                <EventCard event={event} viewMode="list" />
                {tab === 'hosting' && (
                  <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Edit event
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

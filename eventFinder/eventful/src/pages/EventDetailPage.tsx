import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { MapContainer, CircleMarker, TileLayer } from 'react-leaflet';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { RegistrationModal } from '../components/RegistrationModal';
import { SaveButton } from '../components/SaveButton';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getEventById, isRegistered, cancelRegistration } = useEvents();
  const { showToast } = useToast();

  const event = useMemo(() => (id ? getEventById(id) : undefined), [id, getEventById]);
  const [showModal, setShowModal] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            Event not found
          </h1>
          <p className="text-sm text-slate-500">
            The event you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const registered = user ? isRegistered(event.id, user.id) : false;
  const dateLabel = format(parseISO(event.date), 'EEE d MMM');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {event.coverImage && (
            <div
              className="h-56 bg-cover bg-center md:h-72"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F1FB] px-3 py-1 text-xs font-semibold text-[#185FA5]">
                  {event.category}
                </div>
                <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                  {event.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {event.description}
                </p>
              </div>
              <SaveButton eventId={event.id} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  {dateLabel} - {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {event.ticketType === 'free'
                    ? 'Free event'
                    : `NPR ${event.price ?? 0}`}
                </div>
                <div className="text-xs text-slate-500">
                  Capacity {event.capacity} attendees
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <MapContainer
                  center={[event.lat, event.lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="h-32 w-full rounded-lg"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={[event.lat, event.lng]} radius={8} />
                </MapContainer>
              </div>
            </div>

            <div className="mt-6">
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
                >
                  Sign in to register
                </button>
              )}

              {isAuthenticated && registered && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    You are registered for this event.
                  </p>
                  <button
                    onClick={() => {
                      if (user) {
                        cancelRegistration(event.id, user.id);
                        showToast('Registration cancelled', 'info');
                      }
                    }}
                    className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancel registration
                  </button>
                </div>
              )}

              {isAuthenticated && !registered && (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
                >
                  {event.ticketType === 'free'
                    ? 'Register for free'
                    : `Buy ticket - NPR ${event.price ?? 0}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RegistrationModal event={event} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

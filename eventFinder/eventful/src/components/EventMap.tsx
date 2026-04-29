import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Popup, CircleMarker, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { AppEvent } from '../types';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const categoryColors: Record<AppEvent['category'], string> = {
  Tech: '#3B6D11',
  Music: '#185FA5',
  Food: '#854F0B',
  Art: '#993556',
  Sports: '#0F6E56',
};

interface EventMapProps {
  events: AppEvent[];
  onMarkerClick: (event: AppEvent) => void;
  className?: string;
}

export function EventMap({ events, onMarkerClick, className }: EventMapProps) {
  return (
    <div className={className ?? 'h-64 w-full md:h-[500px]'}>
      <MapContainer
        center={[27.7172, 85.324]}
        zoom={13}
        className="h-full w-full rounded-xl"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {events.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.lat, event.lng]}
            radius={8}
            pathOptions={{ color: categoryColors[event.category] }}
            eventHandlers={{
              click: () => onMarkerClick(event),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-800">
                  {event.title}
                </div>
                  <div className="text-xs text-slate-500">
                    {event.date} - {event.time}
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {event.ticketType === 'free'
                    ? 'Free'
                    : `NPR ${event.price ?? 0}`}
                </div>
                <Link
                  to={`/events/${event.id}`}
                  className="text-xs font-semibold text-[#185FA5]"
                >
                  View details
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

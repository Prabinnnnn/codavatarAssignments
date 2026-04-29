import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { AppEvent } from '../types';
import { SaveButton } from './SaveButton';

interface EventCardProps {
  event: AppEvent;
  viewMode: 'list' | 'grid';
  showSaveButton?: boolean;
}

const categoryStyles: Record<AppEvent['category'], string> = {
  Tech: 'bg-[#EAF3DE] text-[#3B6D11]',
  Music: 'bg-[#E6F1FB] text-[#185FA5]',
  Food: 'bg-[#FAEEDA] text-[#854F0B]',
  Art: 'bg-[#FBEAF0] text-[#993556]',
  Sports: 'bg-[#E1F5EE] text-[#0F6E56]',
};

export function EventCard({
  event,
  viewMode,
  showSaveButton = true,
}: EventCardProps) {
  const navigate = useNavigate();
  const dateLabel = format(parseISO(event.date), 'EEE d MMM');

  const priceLabel =
    event.ticketType === 'free'
      ? { text: 'Free', className: 'bg-[#EAF3DE] text-[#27500A]' }
      : {
          text: `NPR ${event.price ?? 0}`,
          className: 'bg-[#FAEEDA] text-[#854F0B]',
        };

  if (viewMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/events/${event.id}`)}
        onKeyDown={(eventKey) => {
          if (eventKey.key === 'Enter') {
            navigate(`/events/${event.id}`);
          }
        }}
        className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
      >
        <div
          className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg text-center text-xs font-semibold ${
            categoryStyles[event.category]
          }`}
        >
          {dateLabel}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                categoryStyles[event.category]
              }`}
            >
              {event.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                priceLabel.className
              }`}
            >
              {priceLabel.text}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            {event.title}
          </h3>
          <p className="text-sm text-slate-500">
            {event.location} - {event.time}
          </p>
        </div>
        {showSaveButton && <SaveButton eventId={event.id} />}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/events/${event.id}`)}
      onKeyDown={(eventKey) => {
        if (eventKey.key === 'Enter') {
          navigate(`/events/${event.id}`);
        }
      }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md"
    >
      <div
        className={`flex h-24 flex-col items-start justify-end gap-2 p-4 text-white ${
          categoryStyles[event.category]
        }`}
      >
        <span className="text-xs font-semibold uppercase">{dateLabel}</span>
        <span className="text-sm font-semibold">{event.category}</span>
      </div>
      {showSaveButton && (
        <div className="absolute right-3 top-3">
          <SaveButton eventId={event.id} />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800">{event.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{event.location}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">{event.time}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              priceLabel.className
            }`}
          >
            {priceLabel.text}
          </span>
        </div>
      </div>
    </div>
  );
}

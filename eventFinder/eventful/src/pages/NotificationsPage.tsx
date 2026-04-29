import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCircle2,
  MapPin,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { TopNav } from '../components/TopNav';
import { useNotifications } from '../context/NotificationContext';

const iconMap = {
  reminder: Bell,
  update: Megaphone,
  confirmation: CheckCircle2,
  nearby: MapPin,
};

const colorMap = {
  reminder: 'bg-amber-100 text-amber-700',
  update: 'bg-blue-100 text-blue-700',
  confirmation: 'bg-green-100 text-green-700',
  nearby: 'bg-teal-100 text-teal-700',
};

export function NotificationsPage() {
  const { notifications, markRead, markAllRead, unreadCount } =
    useNotifications();
  const navigate = useNavigate();

  const unread = notifications.filter((notif) => !notif.read);
  const read = notifications.filter((notif) => notif.read);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <TopNav
        title="Notifications"
        showAvatar
        rightAction={
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50"
          >
            Mark all read
          </button>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F1FB] text-[#185FA5]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              All caught up
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {unread.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-slate-500">
                  New
                </h3>
                <div className="mt-3 space-y-3">
                  {unread.map((notif) => {
                    const Icon = iconMap[notif.type];
                    return (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markRead(notif.id);
                          navigate(`/events/${notif.eventId}`);
                        }}
                        className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            colorMap[notif.type]
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {notif.subtitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-[#185FA5]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {read.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-slate-500">
                  Earlier
                </h3>
                <div className="mt-3 space-y-3">
                  {read.map((notif) => {
                    const Icon = iconMap[notif.type];
                    return (
                      <button
                        key={notif.id}
                        onClick={() => navigate(`/events/${notif.eventId}`)}
                        className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left opacity-70"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            colorMap[notif.type]
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {notif.subtitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav active="none" />
    </div>
  );
}

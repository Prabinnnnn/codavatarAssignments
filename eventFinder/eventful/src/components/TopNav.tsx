import { Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface TopNavProps {
  title: string;
  showBell?: boolean;
  showAvatar?: boolean;
  rightAction?: React.ReactNode;
}

export function TopNav({
  title,
  showBell = false,
  showAvatar = false,
  rightAction,
}: TopNavProps) {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#185FA5] text-white">
              E
            </div>
            <div className="hidden text-sm font-semibold text-slate-700 md:block">
              {title}
            </div>
          </Link>
          {isAuthenticated && (
            <div className="ml-4 hidden items-center gap-4 text-sm text-slate-600 md:flex">
              <Link to="/home" className="hover:text-[#185FA5]">
                Home
              </Link>
              <Link to="/map" className="hover:text-[#185FA5]">
                Map
              </Link>
              <Link to="/saved" className="hover:text-[#185FA5]">
                Saved
              </Link>
              <Link to="/profile" className="hover:text-[#185FA5]">
                Profile
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {rightAction}
          {showBell && isAuthenticated && (
            <button
              onClick={() => navigate('/notifications')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          )}
          {showAvatar && isAuthenticated && (
            <button
              onClick={() => navigate('/profile')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F1FB] text-sm font-semibold text-[#185FA5]"
            >
              {initials || 'U'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

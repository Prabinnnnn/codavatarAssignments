import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      showToast('Sign in to receive notifications', 'info');
      navigate('/login');
      return;
    }
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-slate-600" />
      {unreadCount > 0 && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}

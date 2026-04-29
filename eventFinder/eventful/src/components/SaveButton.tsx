import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';

interface SaveButtonProps {
  eventId: string;
}

export function SaveButton({ eventId }: SaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toggleSave, isSaved } = useEvents();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const saved = isSaved(eventId);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in to save events', 'info');
      navigate('/login');
      return;
    }
    toggleSave(eventId);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
        saved
          ? 'border-[#185FA5] bg-[#185FA5] text-white'
          : 'border-slate-200 bg-white text-slate-500'
      }`}
      aria-label="Save event"
    >
      <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}

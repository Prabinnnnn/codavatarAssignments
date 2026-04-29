import {
  Bookmark,
  Home,
  MapPin,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BottomNavProps {
  active?: 'home' | 'map' | 'saved' | 'profile' | 'none';
}

const navItems = [
  { key: 'home', label: 'Home', icon: Home, to: '/home' },
  { key: 'map', label: 'Map', icon: MapPin, to: '/map' },
  { key: 'saved', label: 'Saved', icon: Bookmark, to: '/saved' },
  { key: 'profile', label: 'Profile', icon: User, to: '/profile' },
] as const;

export function BottomNav({ active }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active !== 'none' && item.key === active;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex flex-col items-center gap-1 text-xs ${
                isActive ? 'text-[#185FA5]' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

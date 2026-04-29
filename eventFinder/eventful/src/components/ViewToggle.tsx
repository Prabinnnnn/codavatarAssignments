import { LayoutList, MapPin } from 'lucide-react';
import type { ViewMode } from '../types';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
          mode === 'list'
            ? 'bg-[#185FA5] text-white'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <LayoutList className="h-4 w-4" />
        List
      </button>
      <button
        onClick={() => onChange('map')}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
          mode === 'map'
            ? 'bg-[#185FA5] text-white'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <MapPin className="h-4 w-4" />
        Map
      </button>
    </div>
  );
}

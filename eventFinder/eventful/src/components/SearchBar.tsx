import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onChange(input);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [input, onChange]);

  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Search className="h-5 w-5 text-slate-400" />
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={placeholder ?? 'Search events'}
        className="w-full bg-transparent text-sm text-slate-700 outline-none"
      />
    </div>
  );
}

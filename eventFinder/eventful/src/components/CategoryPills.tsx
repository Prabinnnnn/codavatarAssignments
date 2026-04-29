import type { EventCategory } from '../types';

const categories: EventCategory[] = [
  'All',
  'Tech',
  'Music',
  'Food',
  'Art',
  'Sports',
];

interface CategoryPillsProps {
  selected: EventCategory;
  onChange: (cat: EventCategory) => void;
}

export function CategoryPills({ selected, onChange }: CategoryPillsProps) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = category === selected;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all ${
              isActive
                ? 'border-[#185FA5] bg-[#185FA5] text-white'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

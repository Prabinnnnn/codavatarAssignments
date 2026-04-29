import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { FilterState } from '../hooks/useFilteredEvents';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <div
        className={`${open ? 'block' : 'hidden'} space-y-4 rounded-xl border border-slate-200 bg-white p-4 lg:block lg:space-y-0 lg:border-none lg:bg-transparent lg:p-0`}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Date range
            </span>
            <select
              value={filters.dateRange}
              onChange={(event) =>
                onChange({ ...filters, dateRange: event.target.value as FilterState['dateRange'] })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="this-week">This week</option>
              <option value="this-month">This month</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Ticket type
            </span>
            <select
              value={filters.ticketType}
              onChange={(event) =>
                onChange({
                  ...filters,
                  ticketType: event.target.value as FilterState['ticketType'],
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Sort by
            </span>
            <select
              value={filters.sortBy}
              onChange={(event) =>
                onChange({
                  ...filters,
                  sortBy: event.target.value as FilterState['sortBy'],
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="date-asc">Date: soonest</option>
              <option value="date-desc">Date: latest</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

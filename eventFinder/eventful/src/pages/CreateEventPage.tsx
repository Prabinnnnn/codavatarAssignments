import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, isAfter, parseISO, startOfDay } from 'date-fns';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { TopNav } from '../components/TopNav';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import type { AppEvent, EventCategory } from '../types';

const schema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    date: z
      .string()
      .refine((value) => isAfter(parseISO(value), startOfDay(new Date())), {
        message: 'Date must be in the future',
      }),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(3, 'Location is required'),
    category: z.enum(['Tech', 'Music', 'Food', 'Art', 'Sports']),
    ticketType: z.enum(['free', 'paid']),
    price: z.string().optional(),
    capacity: z.string().min(1, 'Capacity is required'),
  })
  .refine(
    (data) => data.ticketType === 'free' || Number(data.price) > 0,
    {
      message: 'Price is required for paid events',
      path: ['price'],
    },
  );

type FormValues = z.infer<typeof schema>;

export function CreateEventPage() {
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: addDays(new Date(), 2).toISOString().slice(0, 10),
      ticketType: 'free',
    },
  });

  const ticketType = watch('ticketType');

  const onSubmit = (values: FormValues) => {
    if (!user) {
      return;
    }

    const event: AppEvent = {
      id: `event-${Date.now()}`,
      title: values.title,
      description: values.description,
      date: values.date,
      time: values.time,
      location: values.location,
      lat: 27.7172,
      lng: 85.324,
      category: values.category as EventCategory,
      ticketType: values.ticketType,
      price: values.ticketType === 'paid' ? Number(values.price) : undefined,
      currency: 'NPR',
      capacity: Number(values.capacity),
      attendees: [],
      hostId: user.id,
      coverImage: coverImage || undefined,
      createdAt: new Date().toISOString(),
    };

    addEvent(event);
    showToast('Event published', 'success');
    navigate(`/events/${event.id}`);
  };

  const filePreview = useMemo(
    () => coverImage || undefined,
    [coverImage],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        title="New event"
        rightAction={
          <button
            onClick={handleSubmit(onSubmit)}
            className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
          >
            Publish
          </button>
        }
      />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-sm font-semibold text-slate-500"
        >
          Cancel
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Event name
                </label>
                <input
                  {...register('title')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Time
                  </label>
                  <input
                    type="time"
                    {...register('time')}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  {errors.time && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.time.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Location
                </label>
                <input
                  {...register('location')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Category</h2>
            <select
              {...register('category')}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="Tech">Tech</option>
              <option value="Music">Music</option>
              <option value="Food">Food</option>
              <option value="Art">Art</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Tickets</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Ticket type
                </label>
                <select
                  {...register('ticketType')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {ticketType === 'paid' && (
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Price (NPR)
                  </label>
                  <input
                    type="number"
                    {...register('price')}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Capacity
              </label>
              <input
                type="number"
                {...register('capacity')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-800">Cover photo</h2>
            <div className="mt-4 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setCoverImage(URL.createObjectURL(file));
                  }
                }}
              />
              {filePreview && (
                <img
                  src={filePreview}
                  alt="Cover preview"
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

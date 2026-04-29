import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { TopNav } from '../components/TopNav';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';

const schema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    date: z.string().min(1, 'Date is required'),
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

export function EditEventPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getEventById, updateEvent, deleteEvent } = useEvents();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const event = id ? getEventById(id) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'Tech',
      ticketType: 'free',
      price: '',
      capacity: '0',
    },
  });

  const ticketType = watch('ticketType');

  useEffect(() => {
    if (!event || !user) {
      return;
    }
    reset({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      ticketType: event.ticketType,
      price: event.price ? String(event.price) : '',
      capacity: String(event.capacity),
    });
    if (event.hostId !== user.id) {
      navigate(`/events/${event.id}`);
    }
  }, [event, user, navigate, reset]);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <p className="text-sm text-slate-500">Event not found.</p>
        </div>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    updateEvent(event.id, {
      title: values.title,
      description: values.description,
      date: values.date,
      time: values.time,
      location: values.location,
      category: values.category,
      ticketType: values.ticketType,
      price: values.ticketType === 'paid' ? Number(values.price) : undefined,
      capacity: Number(values.capacity),
    });
    showToast('Event updated', 'success');
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        title="Edit event"
        rightAction={
          <button
            onClick={handleSubmit(onSubmit)}
            className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        }
      />

      <div className="mx-auto max-w-4xl px-4 py-6">
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="mb-4 text-sm font-semibold text-slate-500"
        >
          Back
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

          <div className="rounded-2xl border border-dashed border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete event
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    deleteEvent(event.id);
                    showToast('Event deleted', 'info');
                    navigate('/profile');
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

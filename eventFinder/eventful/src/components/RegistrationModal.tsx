import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AppEvent, Notification, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

type FormValues = z.infer<typeof schema>;

interface RegistrationModalProps {
  event: AppEvent;
  onClose: () => void;
}

export function RegistrationModal({ event, onClose }: RegistrationModalProps) {
  const { user } = useAuth();
  const { addRegistration } = useEvents();
  const { addNotification } = useNotifications();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email ?? '',
      phone: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const registration: Registration = {
      id: `reg-${Date.now()}`,
      eventId: event.id,
      userId: user?.id ?? 'guest',
      name: values.name,
      email: values.email,
      phone: values.phone,
      registeredAt: new Date().toISOString(),
    };

    addRegistration(registration);

    const notification: Notification = {
      id: `confirmation-${event.id}`,
      type: 'confirmation',
      title: `Registration confirmed for ${event.title}`,
      subtitle: `${event.date} - ${event.location} - ${event.time}`,
      eventId: event.id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    addNotification(notification);
    showToast(`You're registered for ${event.title}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center">
      <div className="w-full rounded-t-2xl bg-white p-6 md:w-[420px] md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Register for {event.title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Full name
            </label>
            <input
              {...register('name')}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Email
            </label>
            <input
              {...register('email')}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Phone
            </label>
            <input
              {...register('phone')}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
          >
            Confirm registration
          </button>
        </form>
      </div>
    </div>
  );
}

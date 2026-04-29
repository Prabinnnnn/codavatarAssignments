import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { TopNav } from '../components/TopNav';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('email', user.email);
    setValue('bio', user.bio ?? '');
    setValue('location', user.location ?? '');
  }, [user, setValue]);

  if (!user) {
    return null;
  }

  const onSubmit = (values: FormValues) => {
    updateUser({
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio,
      location: values.location,
      avatarUrl: avatarPreview ?? user.avatarUrl,
    });
    showToast('Profile updated', 'success');
    navigate('/profile');
  };

  const updatePrefs = (key: keyof typeof user.notificationPrefs) => {
    updateUser({
      notificationPrefs: {
        ...user.notificationPrefs,
        [key]: !user.notificationPrefs[key],
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        title="Edit profile"
        rightAction={
          <button
            onClick={handleSubmit(onSubmit)}
            className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        }
      />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => navigate('/profile')}
          className="mb-4 text-sm font-semibold text-slate-500"
        >
          Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#E6F1FB] text-lg font-semibold text-[#185FA5]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                <Camera className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  First name
                </label>
                <input
                  {...register('firstName')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Last name
                </label>
                <input
                  {...register('lastName')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Email
              </label>
              <input
                {...register('email')}
                disabled
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Location
              </label>
              <input
                {...register('location')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Notification preferences
          </h2>
          <div className="mt-4 space-y-4">
            {(
              [
                { key: 'eventReminders', label: 'Event reminders' },
                { key: 'newEventsNearby', label: 'New events nearby' },
                { key: 'registrationUpdates', label: 'Registration updates' },
              ] as const
            ).map((pref) => (
              <div
                key={pref.key}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {pref.label}
                </span>
                <button
                  type="button"
                  onClick={() => updatePrefs(pref.key)}
                  className={`relative h-6 w-11 rounded-full transition-all ${
                    user.notificationPrefs[pref.key]
                      ? 'bg-[#185FA5]'
                      : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      user.notificationPrefs[pref.key] ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

import { AuthProvider } from './AuthContext';
import { EventProvider } from './EventContext';
import { NotificationProvider } from './NotificationContext';
import { ToastProvider } from './ToastContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventProvider>
        <NotificationProvider>
          <ToastProvider>{children}</ToastProvider>
        </NotificationProvider>
      </EventProvider>
    </AuthProvider>
  );
}

let notice: string | null = null;
const listeners = new Set<(message: string) => void>();

export function notifySuspended(message: string) {
  notice = message;
  listeners.forEach((listener) => listener(message));
}

export function consumeSuspendedNotice() {
  const value = notice;
  notice = null;
  return value;
}

export function subscribeSuspended(listener: (message: string) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

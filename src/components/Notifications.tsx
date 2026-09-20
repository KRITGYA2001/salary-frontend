import { Alert, Snackbar } from '@mui/material';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

const AUTO_HIDE_MS = 4000;

type Notify = (message: string) => void;

const NotificationContext = createContext<Notify>(() => undefined);

/** Shows short success confirmations; errors stay inline next to the action that failed. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const notify = useCallback<Notify>((text) => setMessage(text), []);
  const value = useMemo(() => notify, [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={message !== null}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);

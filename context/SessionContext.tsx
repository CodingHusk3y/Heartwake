import React, { createContext, useCallback, useContext, useState } from 'react';

export type SleepSessionConfig = {
  targetTime: string; // ISO string of latest wake time
  windowMinutes: number; // minutes before target to begin early wake window
  alarmId?: string; // source alarm id for cleanup
  startedAt?: string; // session start time for duration
};

export type SleepSessionState = {
  active: boolean;
  startedAt?: string;
  earlyWakeTriggered?: boolean;
  wakeTime?: string;
  stage?: string;
};

type SessionContextValue = {
  config?: SleepSessionConfig;
  state: SleepSessionState;
  setConfig: (c: SleepSessionConfig) => void;
  updateState: (partial: Partial<SleepSessionState>) => void;
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SleepSessionConfig | undefined>(undefined);
  const [state, setState] = useState<SleepSessionState>({ active: false });

  const updateState = useCallback((partial: Partial<SleepSessionState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setState({ active: false });
    setConfig(undefined);
  }, []);

  return (
    <SessionContext.Provider value={{ config, state, setConfig, updateState, reset }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

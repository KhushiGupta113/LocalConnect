import { createContext, useContext, type ReactNode } from 'react';

const GateContext = createContext<(() => void) | null>(null);

type GateProviderProps = {
  onReturnToSplash: () => void;
  children: ReactNode;
};

export function GateProvider({ onReturnToSplash, children }: GateProviderProps) {
  return (
    <GateContext.Provider value={onReturnToSplash}>{children}</GateContext.Provider>
  );
}

export function useReturnToSplash(): () => void {
  const value = useContext(GateContext);
  if (value === null) {
    throw new Error('useReturnToSplash must be used within GateProvider');
  }
  return value;
}

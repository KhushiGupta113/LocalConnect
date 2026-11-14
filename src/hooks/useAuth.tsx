import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { defaultNeighborhood } from '../constants/neighborhoods';
import { buildSession } from '../services/profile';
import { nameFromEmail } from '../services/validation';
import {
  apiGetMe,
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  setAuthToken,
} from '../services/api';
import type {
  RegisteredAccount,
  RegistrationValues,
  SessionUser,
} from '../types/user';

type AuthContextValue = {
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (values: RegistrationValues) => Promise<string | null>;
  updateProfile: (patch: Partial<SessionUser>) => Promise<string | null>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function accountKey(email: string): string {
  return email.trim().toLowerCase();
}

function withoutPassword(account: RegisteredAccount): SessionUser {
  const { password: _password, ...profile } = account;
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [accounts, setAccounts] = useState<Record<string, RegisteredAccount>>({});

  // Attempt to rehydrate session on boot
  useEffect(() => {
    let mounted = true;
    apiGetMe()
      .then((me) => {
        if (mounted && me) {
          setUser(me);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      async signIn(email, password) {
        // Try real backend first
        const apiRes = await apiLogin({ email, password });
        if (apiRes.success) {
          setUser(apiRes.user);
          return null;
        }

        // If backend returned a specific authentication error (e.g. wrong password)
        if (apiRes.message && !apiRes.message.includes('Network request failed') && !apiRes.message.includes('Failed to fetch')) {
          return apiRes.message;
        }

        // Graceful fallback for mock mode if backend is unreachable
        const key = accountKey(email);
        const existing = accounts[key];
        if (existing !== undefined && existing.password !== password) {
          return 'That password does not match the account created in this session.';
        }
        if (existing !== undefined) {
          setUser(withoutPassword(existing));
          return null;
        }

        // Fallback default mock user for local tests
        const session = buildSession({
          fullName: nameFromEmail(email),
          email,
          neighborhood: 'Oakridge Commons',
          neighborhoodDetail: defaultNeighborhood?.detail ?? '',
        });
        setUser(session);
        return null;
      },

      async signUp(values) {
        // Try real backend first
        const apiRes = await apiRegister(values);
        if (apiRes.success) {
          setUser(apiRes.user);
          return null;
        }

        // If backend returned specific business logic/validation error
        if (apiRes.message && !apiRes.message.includes('Network request failed') && !apiRes.message.includes('Failed to fetch')) {
          return apiRes.message;
        }

        // Fallback for mock mode
        const key = accountKey(values.email);
        if (accounts[key] !== undefined) {
          return 'An account with this email already exists in this session. Log in instead.';
        }
        const profile = buildSession({
          fullName: values.fullName.trim(),
          email: values.email,
          neighborhood: values.neighborhood.trim(),
          neighborhoodDetail: values.neighborhoodDetail,
        });
        setAccounts((current) => ({
          ...current,
          [key]: { ...profile, password: values.password },
        }));
        setUser(profile);
        return null;
      },

      async updateProfile(patch) {
        if (user === null) {
          return 'Sign in before editing your profile.';
        }

        const next = { ...user, ...patch, email: user.email };
        if (next.fullName.trim().length < 2) {
          return 'Enter your full name.';
        }
        if (!/^[a-z0-9_]{3,20}$/i.test(next.handle)) {
          return 'Use 3–20 letters, numbers, or underscores for your handle.';
        }
        if (next.bio.length > 200) {
          return 'Bio must be 200 characters or fewer.';
        }

        // Try backend update
        const apiRes = await apiUpdateProfile(patch);
        if (apiRes.success) {
          setUser(apiRes.user);
          return null;
        }

        // If specific error from server
        if (apiRes.message && !apiRes.message.includes('Network request failed')) {
          return apiRes.message;
        }

        // Fallback local update
        setUser(next);
        const key = accountKey(user.email);
        setAccounts((current) => {
          const existing = current[key];
          if (existing === undefined) return current;
          return { ...current, [key]: { ...existing, ...next, password: existing.password } };
        });
        return null;
      },

      signOut() {
        setAuthToken(null);
        setUser(null);
      },
    };
  }, [accounts, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}

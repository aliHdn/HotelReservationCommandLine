import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { uid } from '@/data/demo';
import type { Reservation, User } from '@/types';

interface StoreValue {
  // auth
  user: User | null;
  login: (email: string, role: string) => void;
  xtoken: (token: string) => string;
  signup: (email: string, role: string) => { ok: boolean };
  logout: () => void;
  token: string;
}

const StoreContext = createContext<StoreValue | null>(null);

const LS_USER = 'aurelia.user';
const LS_USERS = 'aurelia.users';

interface StoredUser extends User {
  password?: string;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(() => load<User | null>(LS_USER, null));
  const [users, setUsers] = useState<StoredUser[]>();


  useEffect(() => save(LS_USER, user), [user]);
  useEffect(() => save(LS_USERS, users), [users]);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) setRole(savedRole);
    //setLoading(false);
  }, []);

  // Save to storage any time they change
  useEffect(() => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [user, role]);

  const login = useCallback<StoreValue['login']>(
    (email, role) => {
      const newUser: User = {
        id: uid('user'),
        name: email.split('@')[0],
        email,
        role: role as 'Customer' | 'Admin',
        avatarHue: Math.floor(Math.random() * 360),
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
    },
    []
  );

  const signup = useCallback<StoreValue['signup']>(
    (name, role) => {

      return { ok: true };
    },
    [users]
  );

  const storeXToken = useCallback<StoreValue['xtoken']>(
    (token) => {
      setToken(token);
      return token;
    },
    [users]
  );

  const logout = useCallback(async () => {

    try {
      const response = await fetch("http://localhost:7105/api/Auth/Logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": token || "",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },

      });
      const result = await response.json();
      if (response.ok) {
        console.log("Logged out successfully");
        setUser(null);
      }
      else {
        console.log('Something went wrong.');
      }
    } catch (e) {
      console.log(e);
    } finally {
      // setLoadingSubmit(false);
    }
  }, [token]);




  const value = useMemo<StoreValue>(
    () => ({ user, login, signup, logout, xtoken: storeXToken, token: token || '' }),
    [user, login, signup, logout, storeXToken, token]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

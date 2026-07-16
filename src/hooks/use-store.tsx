import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import dayjs from "dayjs";
import { STORAGE_KEYS } from "@/lib/contant";
import type { AuthTokens, SwitchTokens } from "@/api/types/auth";
import type { CurrentUser } from "@/api/types/user";
import type { Lab } from "@/api/types/lab";

export interface StoredPermissions {
  role: string;
  isAdmin: boolean;
  permissions: string[];
}

interface IState {
  auth: AuthTokens | null;
  user: CurrentUser | null;
  lab: Lab | null;
  permissions: string[] | null;
  role: string | null;
  isAdmin: boolean;
}

export const initialStates: IState = {
  auth: null,
  user: null,
  lab: null,
  permissions: null,
  role: null,
  isAdmin: false,
};

export interface StoreContext extends IState {
  hydrated: boolean;
  setAuth: (auth: AuthTokens | SwitchTokens) => void;
  unsetAuth: () => void;
  setUser: (user: CurrentUser | null) => void;
  setLab: (lab: Lab | null) => void;
  setPermissions: (data: StoredPermissions | null) => void;
  can: (permission: string) => boolean;
}

const store = createContext<StoreContext | null>(null);

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function clearSessionStorage() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.USER);
  // localStorage.removeItem(STORAGE_KEYS.LAB);
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<IState>(initialStates);
  const [hydrated, setHydrated] = useState(false);

  const setAuth = useCallback((auth: AuthTokens | SwitchTokens) => {
    if (!auth?.access_token) return;

    // Lab/session change → force user, lab, and permissions to re-fetch
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAB);

    setState((p) => {
      const merged = { ...p.auth, ...auth } as AuthTokens;
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(merged));
      return {
        ...p,
        auth: merged,
        user: null,
        lab: null,
        permissions: null,
        role: null,
        isAdmin: false,
      };
    });
  }, []);

  const unsetAuth = useCallback(() => {
    clearSessionStorage();
    setState({ ...initialStates });
    window.location.replace("/signin");
  }, []);

  const setUser = useCallback((user: CurrentUser | null) => {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      setState((p) => ({ ...p, user: null }));
      return;
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setState((p) => ({ ...p, user }));
  }, []);

  const setLab = useCallback((lab: Lab | null) => {
    if (lab === null) {
      localStorage.removeItem(STORAGE_KEYS.LAB);
      setState((p) => ({ ...p, lab: null }));
      return;
    }
    localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(lab));
    setState((p) => ({ ...p, lab }));
  }, []);

  // In-memory only — re-fetched on every full page load
  const setPermissions = useCallback((data: StoredPermissions | null) => {
    if (data === null) {
      setState((p) => ({
        ...p,
        permissions: null,
        role: null,
        isAdmin: false,
      }));
      return;
    }
    setState((p) => ({
      ...p,
      permissions: data.permissions,
      role: data.role,
      isAdmin: data.isAdmin,
    }));
  }, []);

  const can = useCallback(
    (permission: string) => {
      if (state.isAdmin) return true;
      return (state.permissions ?? []).includes(permission);
    },
    [state.isAdmin, state.permissions],
  );

  useEffect(() => {
    if (!hydrated || !state.auth?.refresh_token_expires_at) return;
    const expiresAt = dayjs(state.auth.refresh_token_expires_at);
    if (!expiresAt.isValid() || expiresAt.isAfter(dayjs())) return;
    unsetAuth();
  }, [hydrated, state.auth?.refresh_token_expires_at, unsetAuth]);

  useEffect(() => {
    try {
      const auth = parseJson<AuthTokens>(
        localStorage.getItem(STORAGE_KEYS.AUTH) ?? "",
      );
      const user = parseJson<CurrentUser>(
        localStorage.getItem(STORAGE_KEYS.USER) ?? "",
      );

      setState({
        auth: auth?.access_token ? auth : null,
        user: user?._id ? user : null,
        permissions: null,
        lab: null,
        role: null,
        isAdmin: false,
      });
    } catch (error) {
      console.error("Error loading session from storage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  return (
    <store.Provider
      value={{
        ...state,
        hydrated,
        setAuth,
        unsetAuth,
        setUser,
        setLab,
        setPermissions,
        can,
      }}
    >
      {children}
    </store.Provider>
  );
}

export function useStore(): StoreContext {
  const context = useContext(store);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

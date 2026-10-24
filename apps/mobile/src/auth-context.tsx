import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { getStoredToken, removeToken, storeToken } from "./storage";

interface AuthValue {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredToken()
      .then(setToken)
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthValue>(() => ({
    token,
    isLoading,
    signIn: async (nextToken) => {
      await storeToken(nextToken);
      setToken(nextToken);
    },
    signOut: async () => {
      await removeToken();
      setToken(null);
    },
  }), [isLoading, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  getSessionUserAction,
  type SessionUser,
} from "../lib/action/auth/session.action";
import { logoutAction } from "../lib/action/auth/logout.action";

interface UserContextType {
  user: SessionUser | null;
  setUser: React.Dispatch<React.SetStateAction<SessionUser | null>>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await logoutAction();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [router]);

  // Sincronizar estado cuando el servidor envía un nuevo usuario (ej. navegación)
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  /** Refresca los datos del usuario desde la DB */
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const freshUser = await getSessionUserAction();
      if (freshUser) {
        setUser(freshUser);
      } else {
        // Sesión expirada o inválida
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Sincronizar JWT con la DB al montar (cubre el caso donde un admin
  // cambió el rol de otro usuario — el JWT se regenera en el siguiente load)
  useEffect(() => {
    if (!user) return;
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // Verificar sesión periódicamente (cada 5 minutos)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(
      () => {
        refreshUser();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(intervalId);
  }, [user, refreshUser]);

  // Verificar sesión cuando la ventana recupera el foco
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, refreshUser]);

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, refreshUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

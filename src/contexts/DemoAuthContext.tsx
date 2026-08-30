import React, { createContext, useContext, useState } from "react";
import { demoUsers } from "@/demo-data/users";
import { saveToStorage, loadFromStorage } from "@/utils/sessionStoragePersistence";

export type DemoUserRole = "manager" | "staff" | "client";

const AUTH_STORAGE_KEY = "demoAuthRole";
export interface DemoUser {
  name: string;
  role: DemoUserRole;
  horses: number[];
  // Links a "client" role demo user to their record in demo-data/clients.ts,
  // so animal.ownerId can be checked against the logged-in owner.
  clientId?: number;
}

interface DemoAuthContextType {
  user: DemoUser | null;
  loginAs: (role: DemoUserRole) => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  user: null,
  loginAs: () => {},
});

export const useDemoAuth = () => useContext(DemoAuthContext);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<DemoUser | null>(() => {
    const persistedRole = loadFromStorage<DemoUserRole>(AUTH_STORAGE_KEY);
    return persistedRole ? demoUsers[persistedRole] as DemoUser : null;
  });

  const loginAs = (role: DemoUserRole) => {
    setUser(demoUsers[role] as DemoUser);
    saveToStorage(AUTH_STORAGE_KEY, role);  
  };

  return (
    <DemoAuthContext.Provider value={{ user, loginAs }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

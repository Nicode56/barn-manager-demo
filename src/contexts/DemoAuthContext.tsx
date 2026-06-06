import React, { createContext, useContext, useState } from "react";
import { demoUsers } from "@/demo-data/users";

type Role = "barn_manager" | "barn_staff" | "client";

interface DemoAuthContextType {
  user: any | null;
  loginAs: (role: Role) => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  user: null,
  loginAs: () => {},
});

export const useDemoAuth = () => useContext(DemoAuthContext);

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);

  const loginAs = (role: Role) => {
    setUser(demoUsers[role]);
  };

  return (
    <DemoAuthContext.Provider value={{ user, loginAs }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

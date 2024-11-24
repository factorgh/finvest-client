"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  roles: string;
  setRoles: (roles: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [roles, setRolesState] = useState<string>("");

  // Load roles from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoles = localStorage.getItem("roles");
      if (storedRoles) {
        setRolesState(storedRoles);
      }
    }
  }, []);

  const setRoles = (newRoles: string) => {
    setRolesState(newRoles);
    if (typeof window !== "undefined") {
      localStorage.setItem("roles", newRoles);
    }
  };

  return (
    <AuthContext.Provider value={{ roles, setRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

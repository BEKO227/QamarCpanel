"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("admin-token="));
    setIsLoggedIn(!!token);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);

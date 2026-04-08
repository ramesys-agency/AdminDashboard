"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type BusinessType = "vydhra" | "ramesys";

interface BusinessContextType {
  activeBusiness: BusinessType;
  setActiveBusiness: (business: BusinessType) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [activeBusiness, setActiveBusiness] = useState<BusinessType>("vydhra");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("activeBusiness") as BusinessType;
    if (stored === "vydhra" || stored === "ramesys") {
      setActiveBusiness(stored);
    }
  }, []);

  const handleSetBusiness = (business: BusinessType) => {
    setActiveBusiness(business);
    localStorage.setItem("activeBusiness", business);
    // When switching businesses, we should push to the standard dashboard or stay on shared routes 
    // It's handled externally or user expects just data swap if on shared route.
  };

  // Prevent hydration mismatch by not rendering until mounted if storing state that differs from server
  if (!isMounted) {
    return null; // Or a minimalist loading spinner
  }

  return (
    <BusinessContext.Provider
      value={{ activeBusiness, setActiveBusiness: handleSetBusiness }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}

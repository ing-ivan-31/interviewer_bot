"use client";

import { ReactNode, useEffect, useState } from "react";
import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance } from "./msal-config";

interface MsalProviderProps {
  children: ReactNode;
}

export function MsalProvider({ children }: MsalProviderProps): ReactNode {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance
      .initialize()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((error: unknown) => {
        console.error("MSAL initialization failed:", error);
      });
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <MsalReactProvider instance={msalInstance}>{children}</MsalReactProvider>
  );
}

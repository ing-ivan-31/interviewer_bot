"use client";

import { ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msal-config";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

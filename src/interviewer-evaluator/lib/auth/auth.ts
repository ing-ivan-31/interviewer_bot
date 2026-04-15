"use client";

import {
  InteractionRequiredAuthError,
  AccountInfo,
} from "@azure/msal-browser";
import { msalInstance, loginRequest } from "./msal-config";

const DEFAULT_SCOPES = ["openid", "profile", "email"];

export async function getAccessToken(
  scopes: string[] = DEFAULT_SCOPES
): Promise<string> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    throw new Error("No authenticated account found");
  }

  const account = accounts[0];

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.loginRedirect({
        ...loginRequest,
        scopes,
      });
      throw new Error("Redirecting to login");
    }
    throw error;
  }
}

export function getActiveAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export function isAuthenticated(): boolean {
  return msalInstance.getAllAccounts().length > 0;
}

export async function signOut(): Promise<void> {
  const account = getActiveAccount();

  await msalInstance.logoutRedirect({
    account,
    postLogoutRedirectUri: "/login",
  });
}

export async function signIn(redirectPath?: string): Promise<void> {
  const state = redirectPath ? JSON.stringify({ redirectPath }) : undefined;

  await msalInstance.loginRedirect({
    ...loginRequest,
    state,
  });
}

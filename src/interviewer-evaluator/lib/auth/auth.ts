"use client";

import {
  InteractionRequiredAuthError,
  SilentRequest,
} from "@azure/msal-browser";
import { msalInstance, defaultScopes } from "./msal-config";

/**
 * Acquires an access token silently from the MSAL cache.
 * If silent acquisition fails (e.g. refresh token expired), redirects to /login.
 *
 * @param scopes - OAuth scopes to request. Defaults to ["openid", "profile", "email"].
 * @returns A promise that resolves to the access token string.
 */
export async function getAccessToken(
  scopes: string[] = defaultScopes
): Promise<string> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    window.location.href = "/login";
    // Return a promise that never resolves — redirect is in-flight
    return new Promise(() => {});
  }

  const request: SilentRequest = {
    scopes,
    account: accounts[0],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      window.location.href = "/login";
      // Return a promise that never resolves — redirect is in-flight
      return new Promise(() => {});
    }
    throw error;
  }
}

/**
 * Signs the user out by clearing the MSAL cache and triggering a logout redirect.
 * After logout, Azure AD redirects back to /login (configured as postLogoutRedirectUri).
 */
export async function signOut(): Promise<void> {
  const accounts = msalInstance.getAllAccounts();
  const account = accounts[0];

  await msalInstance.logoutRedirect({
    account: account ?? null,
    postLogoutRedirectUri: "/login",
  });
}

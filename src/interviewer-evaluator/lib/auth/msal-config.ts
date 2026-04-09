import { Configuration, PublicClientApplication } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_MSAL_CLIENT_ID;
const authority = process.env.NEXT_PUBLIC_MSAL_AUTHORITY;
const redirectUri = process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI;

if (!clientId) {
  console.error(
    "[msal-config] NEXT_PUBLIC_MSAL_CLIENT_ID is not set. MSAL will not initialize correctly."
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: authority ?? "https://login.microsoftonline.com/common",
    redirectUri: redirectUri ?? "http://localhost:3000/auth/callback",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const defaultScopes: string[] = ["openid", "profile", "email"];

export const msalInstance = new PublicClientApplication(msalConfig);

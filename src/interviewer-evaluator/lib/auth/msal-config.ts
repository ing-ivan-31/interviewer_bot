import { PublicClientApplication, Configuration, LogLevel } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID ?? "",
    authority: process.env.NEXT_PUBLIC_MSAL_AUTHORITY ?? "",
    redirectUri: process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI ?? "",
    postLogoutRedirectUri: "/login",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export const msalInstance = new PublicClientApplication(msalConfig);

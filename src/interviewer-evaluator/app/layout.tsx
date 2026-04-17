import type { Metadata } from "next";
import "./globals.css";
import { MsalProvider } from "@/lib/auth/msal-provider";
import { libreFranklin } from "./fonts";

export const metadata: Metadata = {
  title: "JS/React Interviewer Evaluator",
  description: "AI-powered technical interview evaluation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreFranklin.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MsalProvider>{children}</MsalProvider>
      </body>
    </html>
  );
}

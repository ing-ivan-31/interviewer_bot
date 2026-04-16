"use client";

import Image from "next/image";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { signOut } from "@/lib/auth/auth";

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Navbar({
  onMenuClick,
  showMenuButton = true,
}: NavbarProps): React.ReactNode {
  const [imageError, setImageError] = useState(false);
  const { instance } = useMsal();

  const account = instance.getAllAccounts()[0];
  const userName = account?.name ?? account?.username ?? "User";

  // Truncate long names
  const displayName =
    userName.length > 20 ? `${userName.substring(0, 17)}...` : userName;

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between z-50"
      style={{
        height: "var(--header-height)",
        background: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 var(--spacing-4)",
      }}
      aria-label="Main navigation"
    >
      {/* Left section: hamburger + logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger menu - only visible on mobile */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md transition-colors md:hidden"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Toggle menu"
            aria-expanded="false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Logo */}
        {imageError ? (
          <span
            className="font-bold"
            style={{
              color: "var(--color-primary)",
              fontSize: "var(--font-size-base)",
            }}
          >
            APEX SYSTEMS
          </span>
        ) : (
          <Image
            src="/images/apex-logo-horizontal-color.png"
            alt="Apex Systems"
            width={120}
            height={32}
            style={{ height: "32px", width: "auto", maxHeight: "32px" }}
            onError={() => setImageError(true)}
            priority
          />
        )}
      </div>

      {/* Right section: user name + sign out */}
      <div className="flex items-center gap-4">
        <span
          className="hidden sm:inline-block"
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-primary)",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </span>
        <button
          onClick={handleSignOut}
          className="transition-colors"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-primary)";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.textDecoration = "none";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = `2px solid var(--color-primary)`;
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

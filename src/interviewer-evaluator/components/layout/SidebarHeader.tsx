"use client";

import Image from "next/image";
import { useState } from "react";

interface SidebarHeaderProps {
  onToggle?: () => void;
}

export function SidebarHeader({ onToggle }: SidebarHeaderProps): React.ReactNode {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-2">
        {imageError ? (
          <span
            className="font-bold text-sm"
            style={{ color: "var(--color-primary)" }}
          >
            APEX SYSTEMS
          </span>
        ) : (
          <Image
            src="/images/apex-logo-horizontal-color.png"
            alt="Apex Systems"
            width={120}
            height={32}
            style={{ height: "32px", width: "auto" }}
            onError={() => setImageError(true)}
            priority
          />
        )}
      </div>

      <button
        onClick={onToggle}
        className="p-2 rounded-md transition-colors hover:bg-opacity-80"
        style={{
          color: "var(--color-text-secondary)",
        }}
        aria-label="Toggle sidebar"
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
    </div>
  );
}

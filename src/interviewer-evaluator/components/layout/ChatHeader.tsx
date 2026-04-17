"use client";

interface ChatHeaderProps {
  title: string;
  badge?: string;
}

export function ChatHeader({ title, badge }: ChatHeaderProps): React.ReactNode {
  return (
    <header
      className="flex items-center justify-between px-6"
      style={{
        height: "var(--header-height)",
        background: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <h1
          className="text-lg font-semibold truncate"
          style={{
            color: "var(--color-text-primary)",
            maxWidth: "200px",
          }}
          title={title}
        >
          {title}
        </h1>
        {badge && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "var(--teal-3)",
              color: "var(--teal-1)",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Settings icon */}
        <button
          className="p-2 rounded-md transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Settings"
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* User avatar placeholder */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ background: "var(--color-primary)" }}
          aria-label="User menu"
        >
          U
        </button>
      </div>
    </header>
  );
}

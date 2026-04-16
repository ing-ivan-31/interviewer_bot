"use client";

interface NewChatButtonProps {
  onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps): React.ReactNode {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-2
        px-4 py-3 rounded-md text-sm font-medium
        transition-colors
      "
      style={{
        background: "var(--color-background)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-sidebar-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-background)";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      <span>New chat</span>
    </button>
  );
}

"use client";

export interface ChatItem {
  id: string;
  title: string;
  preview?: string;
  timestamp: Date;
}

interface SidebarChatListProps {
  chats: ChatItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function SidebarChatList({
  chats,
  activeId,
  onSelect,
}: SidebarChatListProps): React.ReactNode {
  if (chats.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-8 text-sm text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        No conversations yet.
        <br />
        Start a new chat!
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto space-y-1"
      role="listbox"
      aria-label="Chat history"
      aria-activedescendant={activeId ? `chat-${activeId}` : undefined}
    >
      {chats.map((chat) => {
        const isActive = chat.id === activeId;
        return (
          <button
            key={chat.id}
            id={`chat-${chat.id}`}
            role="option"
            aria-selected={isActive}
            onClick={() => onSelect(chat.id)}
            className={`
              w-full flex flex-col gap-0.5 p-3 rounded-md text-left
              transition-colors group
            `}
            style={{
              background: isActive ? "var(--grey-2)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-sm font-medium truncate flex-1"
                style={{ color: "var(--color-text-primary)" }}
                title={chat.title}
              >
                {chat.title}
              </span>
              <button
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-text-muted)" }}
                aria-label={`More options for ${chat.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Placeholder for options menu
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
            {chat.preview && (
              <span
                className="text-xs truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                {chat.preview}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

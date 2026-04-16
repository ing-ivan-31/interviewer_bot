"use client";

import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav, type Folder } from "./SidebarNav";
import { SidebarChatList, type ChatItem } from "./SidebarChatList";
import { NewChatButton } from "./NewChatButton";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  showHeader?: boolean;
  hasNavbar?: boolean;
}

// Placeholder data for demo purposes
const DEMO_FOLDERS: Folder[] = [
  { id: "1", name: "Work chats", isActive: false },
  { id: "2", name: "Training sessions", isActive: true },
  { id: "3", name: "Archived", isActive: false },
];

const DEMO_CHATS: ChatItem[] = [
  { id: "1", title: "JavaScript Fundamentals", preview: "Closures and scope discussion", timestamp: new Date() },
  { id: "2", title: "React Hooks Deep Dive", preview: "useEffect cleanup patterns", timestamp: new Date() },
  { id: "3", title: "TypeScript Generics", preview: "Generic constraints explained", timestamp: new Date() },
];

export function Sidebar({
  isCollapsed = false,
  onToggle,
  showHeader = true,
  hasNavbar = false,
}: SidebarProps): React.ReactNode {
  const handleNewChat = (): void => {
    // Placeholder - will be implemented with routing
    console.log("New chat clicked");
  };

  const handleSelectChat = (id: string): void => {
    // Placeholder - will be implemented with routing
    console.log("Chat selected:", id);
  };

  return (
    <aside
      className={`
        fixed left-0 flex flex-col
        border-r transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? "w-0 -translate-x-full" : "w-sidebar"}
        lg:relative lg:translate-x-0
      `}
      style={{
        background: "var(--color-sidebar-bg)",
        borderColor: "var(--color-border)",
        width: isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        top: hasNavbar ? "var(--header-height)" : "0",
        height: hasNavbar ? "calc(100vh - var(--header-height))" : "100vh",
      }}
      aria-label="Sidebar navigation"
    >
      {!isCollapsed && (
        <>
          {showHeader && <SidebarHeader onToggle={onToggle} />}

          {/* Search Input */}
          <div className="px-3 py-2">
            <div
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              style={{
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--color-text-primary)" }}
              />
            </div>
          </div>

          {/* Folders Section */}
          <div className="px-3 py-2">
            <div
              className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              <span>Folders</span>
              <button
                className="p-1 rounded hover:bg-opacity-80 transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Add folder"
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
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>
            <SidebarNav folders={DEMO_FOLDERS} />
          </div>

          {/* Chats Section */}
          <div className="flex-1 overflow-hidden flex flex-col px-3 py-2">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Chats
            </div>
            <SidebarChatList chats={DEMO_CHATS} onSelect={handleSelectChat} />
          </div>

          {/* New Chat Button */}
          <div className="p-3 mt-auto">
            <NewChatButton onClick={handleNewChat} />
          </div>
        </>
      )}
    </aside>
  );
}

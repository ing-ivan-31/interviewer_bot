"use client";

export interface Folder {
  id: string;
  name: string;
  isActive?: boolean;
}

interface SidebarNavProps {
  folders: Folder[];
}

export function SidebarNav({ folders }: SidebarNavProps): React.ReactNode {
  return (
    <nav className="space-y-1" role="navigation" aria-label="Folders">
      {folders.map((folder) => (
        <button
          key={folder.id}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
            transition-colors text-left
          `}
          style={{
            color: "var(--color-text-primary)",
            background: folder.isActive ? "var(--color-sidebar-hover)" : "transparent",
            borderLeft: folder.isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
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
            style={{ color: folder.isActive ? "var(--color-primary)" : "var(--color-text-secondary)" }}
          >
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
          </svg>
          <span className="truncate flex-1" title={folder.name}>
            {folder.name}
          </span>
          <button
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-opacity-50 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
            aria-label={`More options for ${folder.name}`}
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
        </button>
      ))}
    </nav>
  );
}

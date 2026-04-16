# Evaluation Page Layout — ChatGPT-Style Interface

**Status:** Done
**Author:** @spec-writer
**Date:** 2026-04-16

## Purpose

Redesign the candidate evaluation page with a ChatGPT-style layout featuring a collapsible sidebar for chat history, a main chat area with message bubbles, a top navbar with Apex logo and user controls, and responsive behavior across all device sizes.

---

## Reference

Layout based on: `docs/layout_screenshot/layout_1.png`

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ NAVBAR (full width, fixed top)                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [≡] [APEX LOGO]                              [User Name ▼] [Sign Out]│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
├───────────────────────┬─────────────────────────────────────────────────┤
│ SIDEBAR (280px)       │ MAIN CONTENT AREA                               │
│ ┌───────────────────┐ │ ┌─────────────────────────────────────────────┐ │
│ │ 🔍 Search         │ │ │                                             │ │
│ └───────────────────┘ │ │   CHAT MESSAGES (scrollable)                │ │
│                       │ │                                             │ │
│ Folders           [+] │ │   ┌─────────────────────────────────┐       │ │
│ ├─ Work chats         │ │   │ User message (right aligned)    │       │ │
│ ├─ Life chats         │ │   └─────────────────────────────────┘       │ │
│ └─ Project chats      │ │                                             │ │
│                       │ │   ┌─────────────────────────────────┐       │ │
│ Chats                 │ │   │ AI response with code block     │       │ │
│ ├─ Plan 3 day trip    │ │   │ (left aligned)                  │       │ │
│ ├─ Ideas for...       │ │   └─────────────────────────────────┘       │ │
│ └─ Help me edit       │ │                                             │ │
│                       │ └─────────────────────────────────────────────┘ │
│ ┌───────────────────┐ │ ┌─────────────────────────────────────────────┐ │
│ │ [+] New chat      │ │ │ [📎] Type a message...              [➤]    │ │
│ └───────────────────┘ │ └─────────────────────────────────────────────┘ │
│                       │ Footer disclaimer                               │
└───────────────────────┴─────────────────────────────────────────────────┘
```

---

## Files to Create / Modify

```
src/interviewer-evaluator/
├── app/
│   └── (candidate)/
│       └── evaluation/
│           └── page.tsx                    # UPDATE: Use new layout structure
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                      # CREATE: Top navbar with logo + user
│   │   ├── EvaluationLayout.tsx            # CREATE: Wrapper for evaluation page
│   │   └── index.ts                        # UPDATE: Export new components
│   └── chat/
│       ├── ChatContainer.tsx               # CREATE: Scrollable messages area
│       ├── ChatMessage.tsx                 # CREATE: Individual message bubble
│       ├── ChatMessageList.tsx             # CREATE: List of messages
│       ├── CodeBlock.tsx                   # CREATE: Syntax-highlighted code
│       ├── TypingIndicator.tsx             # CREATE: AI typing animation
│       └── index.ts                        # CREATE: Barrel export
└── lib/
    └── stores/
        └── evaluation-store.ts             # CREATE: Zustand store for chat state
```

---

## Component Specifications

### 1. Navbar.tsx

**Purpose:** Top navigation bar with Apex logo, hamburger menu for mobile, user name, and sign out button.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onMenuClick | () => void | no | - | Callback when hamburger menu clicked (mobile) |
| showMenuButton | boolean | no | true | Whether to show hamburger menu |

**Structure:**
```tsx
<nav className="navbar">
  <div className="navbar-left">
    <button className="menu-toggle">{/* hamburger icon */}</button>
    <Image src="/images/apex-logo-horizontal-color.png" alt="Apex Systems" />
  </div>
  <div className="navbar-right">
    <span className="user-name">{userName}</span>
    <button className="sign-out-btn">Sign out</button>
  </div>
</nav>
```

**Styles:**
- Position: `fixed`, top: 0, left: 0, right: 0
- Height: `var(--header-height)` (64px)
- Background: `var(--color-background)` (white)
- Border-bottom: `1px solid var(--color-border)`
- z-index: 50 (above sidebar)
- Logo max-height: 32px
- Hamburger menu: Only visible on mobile (< 768px)
- User name: `var(--font-size-sm)`, `var(--color-text-primary)`
- Sign out button:
  - Background: transparent
  - Color: `var(--color-text-secondary)`
  - Hover: `var(--color-primary)`, underline
  - Font: `var(--font-size-sm)`, `var(--font-weight-medium)`
- Padding: `0 var(--spacing-4)` (16px)
- Flex: `display: flex; justify-content: space-between; align-items: center`

---

### 2. EvaluationLayout.tsx

**Purpose:** Layout wrapper that composes Navbar, Sidebar, and main content area for the evaluation page.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | yes | - | Main content to render |

**Structure:**
```tsx
<div className="evaluation-layout">
  <Navbar onMenuClick={toggleSidebar} />
  <div className="evaluation-body">
    <Sidebar
      isCollapsed={sidebarCollapsed}
      onToggle={toggleSidebar}
      chats={sessions}
      activeId={currentSessionId}
      onSelectChat={handleSelectSession}
    />
    <main className="evaluation-main">
      {children}
    </main>
  </div>
</div>
```

**Styles:**
- `min-height: 100vh`
- `display: flex; flex-direction: column`
- `.evaluation-body`: `display: flex; flex: 1; padding-top: var(--header-height)`
- `.evaluation-main`: `flex: 1; margin-left: var(--sidebar-width)` (when sidebar visible)

**State:**
- `sidebarCollapsed: boolean` — managed internally with useState
- Persisted to localStorage for user preference

---

### 3. ChatContainer.tsx

**Purpose:** Main chat area containing message list and input bar.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| sessionId | string | yes | - | Current evaluation session ID |

**Structure:**
```tsx
<div className="chat-container">
  <ChatMessageList messages={messages} isLoading={isLoading} />
  <div className="chat-input-wrapper">
    <ChatInput
      value={inputValue}
      onChange={setInputValue}
      onSubmit={handleSubmit}
      disabled={isSubmitting}
      placeholder="Type your answer..."
    />
    <p className="chat-disclaimer">
      AI responses are for evaluation purposes only.
    </p>
  </div>
</div>
```

**Styles:**
- `display: flex; flex-direction: column; height: 100%`
- Messages area: `flex: 1; overflow-y: auto; padding: var(--spacing-6)`
- Input wrapper: `position: sticky; bottom: 0; padding: var(--spacing-4)`
- Disclaimer: `var(--font-size-xs)`, `var(--color-text-muted)`, centered

---

### 4. ChatMessage.tsx

**Purpose:** Individual message bubble for user or AI messages.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | string | yes | - | Message content (may contain markdown/code) |
| role | 'user' \| 'assistant' | yes | - | Who sent the message |
| timestamp | Date | no | - | When message was sent |

**Structure:**
```tsx
<div className={`chat-message ${role}`}>
  <div className="message-avatar">
    {role === 'user' ? <UserIcon /> : <AIIcon />}
  </div>
  <div className="message-content">
    <div className="message-header">
      <span className="message-sender">{role === 'user' ? 'You' : 'Evaluator'}</span>
      {timestamp && <span className="message-time">{formatTime(timestamp)}</span>}
    </div>
    <div className="message-body">
      <MarkdownRenderer content={content} />
    </div>
  </div>
</div>
```

**Styles:**

**User messages:**
- Alignment: `flex-direction: row-reverse` (avatar on right)
- Bubble background: `var(--chat-user-bubble-bg)` (#44546A)
- Text color: `var(--chat-user-bubble-text)` (white)
- Border-radius: `var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)`

**AI messages:**
- Alignment: `flex-direction: row` (avatar on left)
- Bubble background: `var(--chat-ai-bubble-bg)` (#EAFDF8)
- Text color: `var(--chat-ai-bubble-text)` (#44546A)
- Border-radius: `var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)`

**Common:**
- Avatar: 32px circle, background `var(--grey-2)`
- Message body: `max-width: 80%`
- Padding: `var(--spacing-3) var(--spacing-4)`
- Margin between messages: `var(--spacing-4)`
- Font: `var(--font-size-base)`, `var(--line-height-relaxed)`

---

### 5. ChatMessageList.tsx

**Purpose:** Scrollable container for chat messages with auto-scroll behavior.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| messages | Message[] | yes | - | Array of messages to display |
| isLoading | boolean | no | false | Show typing indicator at bottom |

**Behavior:**
- Auto-scrolls to bottom when new messages arrive
- Preserves scroll position when user scrolls up to read history
- Shows typing indicator when `isLoading` is true

**Empty state:**
- Center vertically and horizontally
- Apex logo (faded, 20% opacity)
- Text: "Start your technical evaluation"
- Subtitle: "Answer the questions to demonstrate your JavaScript and React expertise"

---

### 6. CodeBlock.tsx

**Purpose:** Syntax-highlighted code block with copy button.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| code | string | yes | - | Code content |
| language | string | no | 'javascript' | Programming language for highlighting |

**Structure:**
```tsx
<div className="code-block">
  <div className="code-header">
    <span className="code-language">{language}</span>
    <button className="copy-btn" onClick={copyToClipboard}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  </div>
  <pre><code>{highlightedCode}</code></pre>
</div>
```

**Styles:**
- Background: `#1E1E1E` (dark, matches screenshot)
- Border-radius: `var(--radius-md)`
- Header: `background: #2D2D2D`, padding `var(--spacing-2) var(--spacing-3)`
- Language label: `var(--font-size-xs)`, `color: #9CA3AF`
- Copy button: `var(--font-size-xs)`, hover color `var(--teal-1)`
- Code: `font-family: 'Fira Code', monospace`, `var(--font-size-sm)`
- Syntax colors (green theme per screenshot):
  - Comments: `#6A9955`
  - Strings: `#CE9178`
  - Keywords: `#569CD6`
  - Functions: `#DCDCAA`

---

### 7. TypingIndicator.tsx

**Purpose:** Animated dots indicating AI is generating a response.

**Props:** None

**Structure:**
```tsx
<div className="typing-indicator">
  <div className="typing-avatar"><AIIcon /></div>
  <div className="typing-dots">
    <span className="dot"></span>
    <span className="dot"></span>
    <span className="dot"></span>
  </div>
</div>
```

**Styles:**
- Same layout as AI message
- Dots: 8px circles, `background: var(--teal-1)`
- Animation: Bounce with staggered delay (0s, 0.2s, 0.4s)
- Keyframes: `translateY(0) → translateY(-8px) → translateY(0)`

---

### 8. evaluation-store.ts (Zustand)

**Purpose:** Global state for evaluation session and chat messages.

**State shape:**
```typescript
interface EvaluationState {
  // Session
  sessionId: string | null;
  sessionStatus: 'idle' | 'loading' | 'active' | 'paused' | 'completed' | 'error';

  // Messages
  messages: Message[];
  isLoadingResponse: boolean;

  // Sidebar
  sessions: SessionSummary[];

  // UI
  sidebarCollapsed: boolean;

  // Actions
  setSessionId: (id: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoadingResponse: (loading: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  loadSessions: () => Promise<void>;
  startNewSession: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SessionSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
}
```

---

## Updated Sidebar Behavior

The existing `Sidebar.tsx` component will be reused with these adjustments:

1. **Remove SidebarHeader logo** — Logo moved to Navbar
2. **Keep collapse toggle** — But position changes (now in Navbar on mobile)
3. **Search input** — Filters chat history
4. **Folders section** — Can be used for organizing past evaluations
5. **Chats section** — Shows previous evaluation sessions
6. **New chat button** — Starts a new evaluation session

---

## Evaluation Page (page.tsx) Update

**Current state:** Basic skeleton with auth check and placeholder content.

**New structure:**
```tsx
'use client';

import { EvaluationLayout } from '@/components/layout';
import { ChatContainer } from '@/components/chat';
import { useEvaluationStore } from '@/lib/stores/evaluation-store';
import { useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { useRouter } from 'next/navigation';

export default function EvaluationPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { sessionId, loadSessions, startNewSession } = useEvaluationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadSessions();

    // Start new session if none active
    if (!sessionId) {
      startNewSession();
    }
  }, [isAuthenticated, sessionId]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <EvaluationLayout>
      {sessionId ? (
        <ChatContainer sessionId={sessionId} />
      ) : (
        <div className="loading-state">Loading...</div>
      )}
    </EvaluationLayout>
  );
}
```

---

## Responsive Behavior

| Breakpoint | Sidebar | Navbar | Layout |
|------------|---------|--------|--------|
| < 768px (mobile) | Hidden, overlay on hamburger click | Shows hamburger menu | Single column |
| >= 768px (tablet) | Collapsible, starts collapsed | Hamburger hidden | Two column |
| >= 1024px (desktop) | Visible by default | Hamburger hidden | Two column |

**Mobile sidebar:**
- Opens as overlay (z-index: 40)
- Backdrop: `rgba(0,0,0,0.5)`, click to close
- Slide-in animation from left

---

## Business Rules

1. **Authentication required** — Redirect to /login if not authenticated.
2. **Session persistence** — Current session ID persisted to localStorage.
3. **Auto-scroll** — Chat scrolls to bottom on new messages unless user scrolled up.
4. **Input validation** — Disable submit when input is empty or whitespace only.
5. **Loading states** — Show typing indicator while waiting for AI response.
6. **Error handling** — Display inline error message if API call fails.
7. **Sidebar state** — Collapsed state persisted to localStorage.

---

## Invariants

- All color values use CSS custom properties, never hardcoded.
- Font family is always `var(--font-family-base)`.
- Spacing uses the defined scale (`--spacing-*`).
- Navbar is always visible (fixed position, z-index 50).
- Chat input is always visible at bottom of main content.
- Logo aspect ratio is never altered.

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No previous sessions | Show empty state in sidebar: "No previous evaluations" |
| Very long message | Word-wrap within bubble, maintain max-width 80% |
| Code block overflow | Horizontal scroll within code block |
| Network error on submit | Show error toast, re-enable input, preserve message |
| Session load fails | Show error state with retry button |
| User rapidly submits | Disable input after first submit, queue not supported |
| Sidebar toggle on mobile | Animate slide-in, add backdrop |
| Browser refresh mid-session | Restore session from localStorage + API |
| Sign out clicked | Clear store, redirect to /login |
| Very long user name | Truncate with ellipsis after 150px |

---

## Accessibility

- Navbar uses `<nav>` element with `aria-label="Main navigation"`
- Sidebar toggle has `aria-expanded` and `aria-controls`
- Chat messages use `role="log"` with `aria-live="polite"`
- Focus moves to input after sending message
- All buttons have visible focus rings using `var(--color-primary)`
- Skip to main content link (hidden, visible on focus)
- Code blocks have `aria-label="Code example in {language}"`

---

## Acceptance Criteria

### Navbar
- [ ] Navbar displays Apex logo (horizontal color) on the left
- [ ] Navbar shows hamburger menu on mobile only (< 768px)
- [ ] Navbar displays authenticated user's name on the right
- [ ] "Sign out" button logs out and redirects to /login
- [ ] Navbar is fixed to top with z-index above sidebar
- [ ] Hamburger click toggles sidebar visibility on mobile

### Layout
- [ ] EvaluationLayout composes Navbar + Sidebar + main content
- [ ] Main content area has correct margin-left when sidebar visible
- [ ] Layout is responsive across mobile/tablet/desktop breakpoints
- [ ] Sidebar collapsed state persists to localStorage

### Chat Components
- [ ] ChatContainer renders message list and input
- [ ] ChatMessageList auto-scrolls to bottom on new messages
- [ ] User messages appear on the right with dark background
- [ ] AI messages appear on the left with light teal background
- [ ] Code blocks have dark theme with syntax highlighting
- [ ] Copy button copies code to clipboard
- [ ] Typing indicator shows animated dots during loading
- [ ] Empty state shows when no messages exist

### State Management
- [ ] Zustand store manages session, messages, and UI state
- [ ] Session ID persists to localStorage
- [ ] Messages update in real-time
- [ ] Loading states reflect API call status

### Quality
- [ ] All text is minimum 12px
- [ ] `npm run typecheck` passes with no errors
- [ ] All components use strict TypeScript — no `any`
- [ ] All interactive elements have hover and focus states

---

## Dependencies

This spec depends on:
- Existing layout components from `2026-04-15-apex-brand-theme.spec.md` (Status: Done)
- MSAL authentication from `2026-04-09-auth.spec.md` (Status: Done)

This spec does NOT implement:
- WebSocket connection for real-time messages (separate spec)
- API integration for sending/receiving messages (backend spec)
- Session management API calls (backend spec)

---

## Out of Scope

- Message editing or deletion
- Keyboard shortcuts beyond Enter to send

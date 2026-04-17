# Apex Brand Theme — Light Mode Layout

**Status:** Done
**Author:** @spec-writer
**Date:** 2026-04-15

## Purpose

Apply Apex Systems brand guidelines to the Next.js frontend with a light theme, ChatGPT-style layout (left sidebar + main chat area), using official brand colors, typography, and logos.

---

## Design Tokens (CSS Custom Properties)

Create a centralized theme file with all brand colors as CSS variables.

### Colors

```css
:root {
  /* === COOL PALETTE === */
  --apex-blue: #44546A;           /* Primary brand color - buttons, links, accents */
  --teal-1: #37B3A2;              /* Secondary accent */
  --teal-2: #9FE2D8;              /* Light teal for hover states, badges */
  --teal-3: #EAFDF8;              /* Very light teal for subtle backgrounds */

  /* === WARM PALETTE === */
  --orange-1: #E7792B;            /* Warning, attention states */
  --orange-2: #EE9F2D;            /* Secondary warm accent */
  --orange-3: #F7C85E;            /* Light orange for highlights */
  --yellow: #F9E661;              /* Success highlights (NOT for text) */

  /* === NEUTRAL PALETTE === */
  --logo-grey: #7C95A5;           /* Logo text, secondary text */
  --grey-1: #808083;              /* Muted text, placeholders */
  --grey-2: #D2DDE8;              /* Borders, dividers, sidebar bg */
  --white: #FFFFFF;               /* Main background */

  /* === SEMANTIC MAPPINGS === */
  --color-primary: var(--apex-blue);
  --color-primary-hover: #374759;  /* Darker shade for hover */
  --color-secondary: var(--teal-1);
  --color-secondary-hover: #2E9A8B;
  --color-background: var(--white);
  --color-surface: #F8FAFC;        /* Cards, elevated surfaces */
  --color-sidebar-bg: #F1F5F9;     /* Sidebar background - light grey */
  --color-sidebar-hover: var(--grey-2);
  --color-border: var(--grey-2);
  --color-text-primary: var(--apex-blue);
  --color-text-secondary: var(--logo-grey);
  --color-text-muted: var(--grey-1);
  --color-error: #DC2626;
  --color-success: var(--teal-1);
  --color-warning: var(--orange-1);

  /* === CHAT SPECIFIC === */
  --chat-user-bubble-bg: var(--apex-blue);
  --chat-user-bubble-text: var(--white);
  --chat-ai-bubble-bg: var(--teal-3);
  --chat-ai-bubble-text: var(--apex-blue);
  --chat-input-bg: var(--white);
  --chat-input-border: var(--grey-2);
  --chat-input-focus-border: var(--apex-blue);
}
```

### Typography

```css
:root {
  /* Font Family - Libre Franklin from Google Fonts */
  --font-family-base: 'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;

  /* Minimum font size: 8pt (per brand guidelines) = ~10.67px, round to 12px */
}
```

### Spacing & Layout

```css
:root {
  /* Spacing Scale */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */

  /* Layout Dimensions */
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 0px;
  --header-height: 64px;
  --chat-input-height: 56px;
  --chat-max-width: 768px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

---

## Files to Create / Modify

```
src/interviewer-evaluator/
├── public/
│   └── images/
│       ├── apex-logo-horizontal-color.png   # Copy from docs/apex_brand_guidelines/
│       └── apex-logo-horizontal-white.png   # Copy from docs/apex_brand_guidelines/
├── app/
│   ├── globals.css                          # UPDATE: Add CSS variables, import font
│   ├── layout.tsx                           # UPDATE: Apply font class, structure
│   ├── fonts.ts                             # CREATE: Next.js font configuration
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx                     # UPDATE: Apply Apex branding
│       └── auth/
│           └── callback/
│               └── page.tsx                 # UPDATE: Apply Apex branding
├── components/
│   └── layout/
│       ├── AppShell.tsx                     # CREATE: Main layout wrapper
│       ├── Sidebar.tsx                      # CREATE: Left sidebar with folders/chats
│       ├── SidebarHeader.tsx                # CREATE: Logo + collapse button
│       ├── SidebarNav.tsx                   # CREATE: Navigation items
│       ├── SidebarChatList.tsx              # CREATE: Chat history list
│       ├── MainContent.tsx                  # CREATE: Main content area wrapper
│       ├── ChatHeader.tsx                   # CREATE: Top bar with chat title
│       ├── ChatInput.tsx                    # CREATE: Bottom input bar
│       └── NewChatButton.tsx                # CREATE: "New chat" button component
└── lib/
    └── theme/
        └── tokens.ts                        # CREATE: TypeScript theme tokens export
```

---

## Layout Structure

Based on the ChatGPT-style screenshots, adapted to light theme:

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (280px)              │ MAIN CONTENT AREA               │
│ ┌─────────────────────────┐  │ ┌─────────────────────────────┐ │
│ │ [APEX LOGO] [≡]         │  │ │ Chat Title        [icons]  │ │
│ └─────────────────────────┘  │ └─────────────────────────────┘ │
│ ┌─────────────────────────┐  │                                 │
│ │ 🔍 Search               │  │   ┌───────────────────────┐     │
│ └─────────────────────────┘  │   │                       │     │
│                              │   │   CHAT MESSAGES       │     │
│ FOLDERS                  +   │   │   (scrollable)        │     │
│ ├─ Work chats       ···     │   │                       │     │
│ ├─ Life chats       ···     │   │   User bubble (right) │     │
│ ├─ Project chats    ···     │   │   AI bubble (left)    │     │
│ └─ Client chats     ···     │   │                       │     │
│                              │   └───────────────────────┘     │
│ CHATS                        │                                 │
│ ├─ Plan 3 day trip  ···     │ ┌─────────────────────────────┐ │
│ ├─ Ideas for a...   ···     │ │ [icon] Type message... [➤] │ │
│ ├─ Help me edit     ···     │ └─────────────────────────────┘ │
│ └─ Write simple...  ···     │                                 │
│                              │ Footer disclaimer               │
│ ┌─────────────────────────┐  │                                 │
│ │ [+] New chat            │  │                                 │
│ └─────────────────────────┘  │                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. AppShell.tsx

**Purpose:** Root layout wrapper that contains sidebar and main content.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | yes | - | Main content to render |

**Structure:**
```tsx
<div className="app-shell">
  <Sidebar />
  <main className="main-content">
    {children}
  </main>
</div>
```

**Styles:**
- `display: flex`
- `min-height: 100vh`
- `background: var(--color-background)`

---

### 2. Sidebar.tsx

**Purpose:** Left sidebar containing logo, search, folders, chat list, and new chat button.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isCollapsed | boolean | no | false | Whether sidebar is collapsed |
| onToggle | () => void | no | - | Callback when toggle button clicked |

**Styles:**
- `width: var(--sidebar-width)` (280px)
- `background: var(--color-sidebar-bg)` (#F1F5F9)
- `border-right: 1px solid var(--color-border)`
- `display: flex; flex-direction: column`
- `height: 100vh`
- `position: fixed` (mobile) or `sticky` (desktop)

**Sub-sections:**
1. SidebarHeader (logo + collapse)
2. Search input
3. Folders section (collapsible)
4. Chats section (scrollable list)
5. NewChatButton (pinned to bottom)

---

### 3. SidebarHeader.tsx

**Purpose:** Top section with Apex logo and collapse toggle.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onToggle | () => void | no | - | Callback for collapse button |

**Logo specs:**
- Use `apex-logo-horizontal-color.png`
- Max height: 32px
- Maintain aspect ratio
- Clear space around logo (as per brand guidelines)

**Collapse button:**
- Icon: hamburger menu (≡)
- Color: `var(--color-text-secondary)`
- Hover: `var(--color-text-primary)`

---

### 4. SidebarNav.tsx

**Purpose:** Folders section with expandable folder items.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| folders | Folder[] | yes | - | Array of folder objects |

**Folder item styles:**
- Padding: `var(--spacing-2) var(--spacing-3)`
- Border-radius: `var(--radius-md)`
- Hover background: `var(--color-sidebar-hover)`
- Text color: `var(--color-text-primary)`
- Font: `var(--font-size-sm)`, `var(--font-weight-medium)`
- Left border on active: `3px solid var(--color-primary)`

---

### 5. SidebarChatList.tsx

**Purpose:** Scrollable list of chat history items.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| chats | ChatItem[] | yes | - | Array of chat items |
| activeId | string | no | - | Currently active chat ID |
| onSelect | (id: string) => void | yes | - | Callback when chat selected |

**Chat item styles:**
- Padding: `var(--spacing-3)`
- Border-radius: `var(--radius-md)`
- Hover background: `var(--color-sidebar-hover)`
- Active background: `var(--grey-2)`
- Title: `var(--font-size-sm)`, `var(--font-weight-medium)`, truncate with ellipsis
- Subtitle/preview: `var(--font-size-xs)`, `var(--color-text-muted)`, max 1 line

---

### 6. NewChatButton.tsx

**Purpose:** Button to create a new chat, pinned to bottom of sidebar.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onClick | () => void | yes | - | Callback when clicked |

**Styles:**
- Background: `var(--color-background)` (white)
- Border: `1px solid var(--color-border)`
- Border-radius: `var(--radius-md)`
- Padding: `var(--spacing-3) var(--spacing-4)`
- Text: `var(--color-text-primary)`, `var(--font-weight-medium)`
- Icon: Plus (+) icon on left
- Hover: `background: var(--color-sidebar-hover)`
- Full width within sidebar padding

---

### 7. ChatHeader.tsx

**Purpose:** Top bar of main content showing chat title and action icons.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | yes | - | Chat/session title |
| badge | string | no | - | Optional badge text (e.g., "GPT 4.0") |

**Styles:**
- Height: `var(--header-height)` (64px)
- Background: `var(--color-background)`
- Border-bottom: `1px solid var(--color-border)`
- Padding: `0 var(--spacing-6)`
- Title: `var(--font-size-lg)`, `var(--font-weight-semibold)`
- Badge: `var(--font-size-xs)`, background `var(--teal-3)`, color `var(--teal-1)`

---

### 8. ChatInput.tsx

**Purpose:** Bottom input bar for typing messages.

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | string | yes | - | Current input value |
| onChange | (value: string) => void | yes | - | Input change handler |
| onSubmit | () => void | yes | - | Submit handler |
| placeholder | string | no | "Type a message..." | Placeholder text |
| disabled | boolean | no | false | Whether input is disabled |

**Styles:**
- Container: fixed to bottom, max-width `var(--chat-max-width)`, centered
- Input wrapper:
  - Background: `var(--chat-input-bg)`
  - Border: `1px solid var(--chat-input-border)`
  - Border-radius: `var(--radius-xl)` (16px) - rounded pill shape
  - Padding: `var(--spacing-3) var(--spacing-4)`
  - Focus: `border-color: var(--chat-input-focus-border)`, subtle shadow
- Submit button:
  - Background: `var(--color-primary)`
  - Color: white
  - Border-radius: `var(--radius-full)`
  - Size: 40px x 40px
  - Icon: Arrow right (➤)
  - Hover: `background: var(--color-primary-hover)`
  - Disabled: opacity 0.5

---

### 9. MainContent.tsx

**Purpose:** Wrapper for the main content area (right side of layout).

**Props:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | ReactNode | yes | - | Content to render |

**Styles:**
- `flex: 1`
- `margin-left: var(--sidebar-width)` (when sidebar visible)
- `display: flex; flex-direction: column`
- `min-height: 100vh`
- `background: var(--color-background)`

---

### 10. LoginPage (app/(auth)/login/page.tsx)

**Purpose:** Branded login page with Apex logo and Microsoft sign-in button.

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │   [APEX LOGO]       │                      │
│                    │                     │                      │
│                    │   JS/React          │                      │
│                    │   Interviewer       │                      │
│                    │   Evaluator         │                      │
│                    │                     │                      │
│                    │   Sign in to start  │                      │
│                    │   your evaluation   │                      │
│                    │                     │                      │
│                    │  ┌───────────────┐  │                      │
│                    │  │ Sign in with  │  │                      │
│                    │  │ Microsoft     │  │                      │
│                    │  └───────────────┘  │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                    Powered by Apex Systems                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Visual Specifications:**

**Page background:**
- Color: `var(--color-surface)` (#F8FAFC) — subtle off-white
- Full viewport height: `min-height: 100vh`
- Centered content: `display: flex; align-items: center; justify-content: center`

**Login card:**
- Background: `var(--color-background)` (white)
- Border-radius: `var(--radius-lg)` (12px)
- Shadow: `var(--shadow-lg)`
- Padding: `var(--spacing-10)` (40px)
- Max-width: 400px
- Width: 100% (with side padding on mobile)

**Logo:**
- Image: `apex-logo-horizontal-color.png`
- Max-height: 48px
- Centered horizontally
- Margin-bottom: `var(--spacing-8)` (32px)

**Title:**
- Text: "JS/React Interviewer Evaluator"
- Font: `var(--font-size-2xl)` (24px), `var(--font-weight-bold)`
- Color: `var(--color-text-primary)` (Apex Blue #44546A)
- Text-align: center
- Margin-bottom: `var(--spacing-2)` (8px)

**Subtitle:**
- Text: "Sign in to start your technical evaluation"
- Font: `var(--font-size-sm)` (14px), `var(--font-weight-regular)`
- Color: `var(--color-text-secondary)` (Logo Grey #7C95A5)
- Text-align: center
- Margin-bottom: `var(--spacing-8)` (32px)

**Sign-in button:**
- Background: `var(--color-primary)` (Apex Blue #44546A)
- Hover background: `var(--color-primary-hover)` (#374759)
- Text: "Sign in with Microsoft"
- Text color: white
- Font: `var(--font-size-sm)`, `var(--font-weight-semibold)`
- Padding: `var(--spacing-3) var(--spacing-4)` (12px 16px)
- Border-radius: `var(--radius-md)` (8px)
- Width: 100%
- Height: 48px
- Transition: `background-color 150ms ease`
- Focus ring: `2px solid var(--color-primary)` with 2px offset

**Footer text (optional):**
- Text: "Powered by Apex Systems"
- Font: `var(--font-size-xs)` (12px)
- Color: `var(--color-text-muted)` (Grey #808083)
- Position: Below card with `var(--spacing-6)` margin
- Text-align: center

**Loading/Redirect state:**
- Background: same as page
- Centered spinner or text
- Text: "Redirecting..." in `var(--color-text-secondary)`
- Font: `var(--font-size-lg)`

---

### 11. AuthCallbackPage (app/(auth)/auth/callback/page.tsx)

**Purpose:** Branded callback handler page with loading state and error display.

**Loading State:**
- Same background as login page: `var(--color-surface)`
- Centered spinner
- Spinner color: `var(--color-primary)` (Apex Blue)
- Text below spinner: "Completing sign in..."
- Font: `var(--font-size-lg)`, `var(--color-text-secondary)`

**Error State:**
- Same card style as login page
- Error icon or heading with `var(--color-error)` (#DC2626)
- Title: "Authentication Error"
- Font: `var(--font-size-2xl)`, `var(--font-weight-bold)`
- Color: `var(--color-error)`
- Error message in `var(--color-text-secondary)`
- "Return to Login" button:
  - Same style as sign-in button
  - Background: `var(--color-primary)`
  - Width: 100%

---

## Tailwind CSS Configuration

Update `tailwind.config.ts` to include brand colors:

```ts
const config = {
  theme: {
    extend: {
      colors: {
        apex: {
          blue: '#44546A',
          'blue-hover': '#374759',
        },
        teal: {
          1: '#37B3A2',
          2: '#9FE2D8',
          3: '#EAFDF8',
        },
        orange: {
          1: '#E7792B',
          2: '#EE9F2D',
          3: '#F7C85E',
        },
        'logo-grey': '#7C95A5',
        grey: {
          1: '#808083',
          2: '#D2DDE8',
        },
      },
      fontFamily: {
        sans: ['var(--font-libre-franklin)', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '280px',
      },
      maxWidth: {
        chat: '768px',
      },
    },
  },
}
```

---

## Google Fonts Integration

Add Libre Franklin via Next.js font optimization:

```ts
// app/fonts.ts
import { Libre_Franklin } from 'next/font/google';

export const libreFranklin = Libre_Franklin({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-libre-franklin',
  display: 'swap',
});
```

---

## Logo Assets

Copy logo files from brand guidelines to public folder:

| Source | Destination | Usage |
|--------|-------------|-------|
| `docs/apex_brand_guidelines/Apex_logo_horizontal_color.png` | `public/images/apex-logo-horizontal-color.png` | Light backgrounds |
| `docs/apex_brand_guidelines/Apex_logo_horizontal_white.png` | `public/images/apex-logo-horizontal-white.png` | Dark backgrounds (future use) |

---

## Business Rules

1. **Minimum font size is 12px** (8pt per brand guidelines, rounded up for web).

2. **Never use Teal #3 or Yellow as text color on light backgrounds** — insufficient contrast per brand guidelines.

3. **Logo must have clear space** — minimum padding equal to the height of the white space in the Apex icon.

4. **Sidebar is collapsible on mobile** — width becomes 0, content slides out.

5. **Chat input always visible** — fixed to bottom of viewport within main content area.

6. **Chat messages container is scrollable** — fills space between header and input.

7. **Active navigation items show left border accent** — 3px solid primary color.

---

## Invariants

- All color values come from CSS custom properties, never hardcoded hex values in components.
- Font family is always `var(--font-family-base)` applied at body level.
- Spacing uses the defined scale (`--spacing-*`), never arbitrary pixel values.
- Border radius uses the defined tokens (`--radius-*`).
- The logo aspect ratio is never altered (per brand guidelines misuse rules).
- Components use semantic color variables (`--color-primary`) not direct palette colors (`--apex-blue`).

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very long chat title | Truncate with ellipsis after 200px |
| Very long folder/chat name in sidebar | Truncate with ellipsis, show full name on hover tooltip |
| Sidebar collapsed on mobile | Overlay with backdrop, swipe to close |
| No chats yet | Show empty state: "No conversations yet. Start a new chat!" |
| Logo fails to load | Show text fallback: "APEX SYSTEMS" in Libre Franklin Bold |
| User types very long message | Input grows vertically up to 4 lines, then scrolls internally |
| Keyboard navigation | All interactive elements are focusable, visible focus ring using primary color |
| Login page on mobile | Card takes full width with 16px side padding |
| Login page logo fails to load | Show "APEX SYSTEMS" text in Apex Blue, font-weight bold |
| Auth callback error from Azure AD | Display error message in card, show "Return to Login" button |
| User already authenticated visits login | Redirect to /evaluation or returnTo param |
| Sign-in button clicked multiple times | Button shows loading state, prevents double submission |

---

## Responsive Breakpoints

| Breakpoint | Sidebar Behavior | Layout |
|------------|------------------|--------|
| < 768px (mobile) | Hidden by default, overlay when open | Single column |
| >= 768px (tablet) | Collapsible, starts collapsed | Two column |
| >= 1024px (desktop) | Visible by default | Two column |

---

## Accessibility

- All interactive elements have `focus-visible` outline using `var(--color-primary)`
- Color contrast ratios meet WCAG AA:
  - Primary text on white: 7.5:1 (passes AAA)
  - Secondary text on white: 4.6:1 (passes AA)
- Logo images have appropriate `alt` text: "Apex Systems"
- Sidebar navigation uses `nav` landmark with `aria-label="Main navigation"`
- Chat list uses `role="listbox"` with `aria-activedescendant`

---

## Acceptance Criteria

### Theme & Configuration
- [ ] CSS custom properties defined in `globals.css` with all brand colors
- [ ] Tailwind config extended with Apex brand colors
- [ ] Libre Franklin font loaded via Next.js font optimization
- [ ] Logo files copied to `public/images/`

### Layout Components
- [ ] AppShell component renders sidebar + main content layout
- [ ] Sidebar displays Apex logo (horizontal color version) at top
- [ ] Sidebar has collapsible folders section
- [ ] Sidebar has scrollable chat list section
- [ ] "New chat" button pinned to bottom of sidebar
- [ ] Chat header displays title with optional badge
- [ ] Chat input has rounded pill shape with submit button
- [ ] Submit button uses Apex Blue (#44546A) as background
- [ ] Hover states use darker shade of primary color
- [ ] Active sidebar items show left border accent
- [ ] Layout is responsive across mobile/tablet/desktop

### Login Page
- [ ] Login page displays Apex logo (horizontal color) centered above title
- [ ] Login page background uses `var(--color-surface)` (#F8FAFC)
- [ ] Login card has white background with `var(--shadow-lg)` shadow
- [ ] Title "JS/React Interviewer Evaluator" uses Apex Blue (#44546A)
- [ ] Subtitle uses Logo Grey (#7C95A5)
- [ ] "Sign in with Microsoft" button uses Apex Blue (#44546A) background
- [ ] Button hover state uses darker shade (#374759)
- [ ] Button has focus ring with primary color
- [ ] Login card is centered vertically and horizontally
- [ ] Login card max-width is 400px with proper padding

### Auth Callback Page
- [ ] Callback page loading state shows spinner in Apex Blue
- [ ] Callback page error state displays in branded card style
- [ ] Error title uses `var(--color-error)` (#DC2626)
- [ ] "Return to Login" button uses same style as sign-in button

### Quality
- [ ] All text is minimum 12px (no smaller than --font-size-xs)
- [ ] Logo has proper clear space around it
- [ ] `npm run typecheck` passes with no errors
- [ ] All components use strict TypeScript — no `any`

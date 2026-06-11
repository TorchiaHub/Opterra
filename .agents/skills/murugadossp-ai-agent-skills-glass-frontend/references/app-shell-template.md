# App Shell Template

Use this reference when creating a new authenticated frontend, dashboard, admin app, editor, or SaaS tool with the Glass Frontend skill.

## Table Of Contents

- [Default Choices](#default-choices)
- [Shell Structure](#shell-structure)
- [Sidebar](#sidebar)
- [Sign-In Pattern](#sign-in-pattern)
- [Profile And Sign-Out](#profile-and-sign-out)
- [Theme Picker](#theme-picker)

## Default Choices

- Theme: Glass Blue/Violet [`default`, light + dark]
- Font: Plus Jakarta Sans [`default`]
- Icons: lucide-react [`default` when available]
- Layout: sidebar app shell [`default` for tools and dashboards]
- Theme mode: `light | dark | system` with system as the default persisted choice

## Shell Structure

Create this hierarchy unless the existing app already has a stronger layout:

```tsx
<ThemeProvider defaultTheme="system">
  <AuthProvider>
    <AppShell>
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileHeader />
        <main>{children}</main>
      </div>
    </AppShell>
  </AuthProvider>
</ThemeProvider>
```

## Sidebar

Expected behavior:

- Desktop: fixed or sticky glass panel, 72-288px wide, collapsible to icon-only.
- Mobile: slide-over panel with `bg-black/30 backdrop-blur-sm` overlay.
- Header: brand icon in a blue/violet gradient square, app name beside it when expanded.
- Navigation: icon+label rows, rounded active route, subdued inactive rows, hover surface in both themes.
- Footer: account/profile block pinned to the bottom.

Default navigation row style:

```tsx
className={`flex items-center rounded-xl transition-all ${
  isActive
    ? "bg-primary/20 text-primary font-medium shadow-sm"
    : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
} ${isCollapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-3"}`}
```

## Sign-In Pattern

Use a centered or context-aware glass card. Include:

- Brand mark at top.
- Clear title like `Sign in to continue`.
- Short product-specific copy, one sentence maximum.
- Provider button with icon and loading state.
- Error message area using `destructive` or rose tokens.
- Secondary link only if the app supports alternate auth.

Default sign-in button style:

```tsx
className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
```

## Profile And Sign-Out

Place account controls in one of two locations:

- Sidebar footer [`default` for desktop app shells]: avatar/initials, name/email, role/plan, menu trigger, sign out.
- Header right: avatar button with dropdown when the sidebar is absent or mobile-first.

Profile menu items should include only relevant actions:

- Profile or account settings
- Billing or plan, if the app has plans
- Theme selector or theme toggle
- Sign out, visually separated and styled as a destructive or muted action

Default profile footer shape:

```tsx
<div className="border-t border-border/50 p-3">
  <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all hover:bg-white/50 dark:hover:bg-white/5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
      {initials}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{displayName}</p>
      <p className="truncate text-xs text-muted-foreground">{email}</p>
    </div>
  </button>
  <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-500">
    <LogOut className="h-4 w-4" />
    Sign out
  </button>
</div>
```

## Theme Picker

If the user asks for options, list:

- Glass Blue/Violet [`default`, light + dark]
- Glass Emerald
- Glass Rose/Indigo
- Glass Monochrome
- Domain theme

If the user does not choose, use Glass Blue/Violet with Plus Jakarta Sans and system theme mode.

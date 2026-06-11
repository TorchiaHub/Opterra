# Theme Tokens And Utilities

Use this reference when you need copyable CSS for the default Glass Blue/Violet token baseline and reusable utility classes.

## Table Of Contents

- [Tailwind v4 Theme Tokens](#tailwind-v4-theme-tokens)
- [Reusable Glass Utilities](#reusable-glass-utilities)

## Tailwind v4 Theme Tokens

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --background: #f8fafc;
  --background-gradient: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 52%, #f0f4ff 100%);
  --foreground: #0f172a;
  --card: rgba(255, 255, 255, 0.72);
  --card-foreground: #0f172a;
  --popover: rgba(255, 255, 255, 0.88);
  --popover-foreground: #0f172a;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: rgba(241, 245, 249, 0.68);
  --secondary-foreground: #0f172a;
  --muted: rgba(241, 245, 249, 0.56);
  --muted-foreground: #64748b;
  --accent: rgba(124, 58, 237, 0.14);
  --accent-foreground: #5b21b6;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: rgba(148, 163, 184, 0.22);
  --input: rgba(148, 163, 184, 0.24);
  --ring: #3b82f6;
  --glass-border: rgba(255, 255, 255, 0.52);
  --glass-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
}

.dark {
  --background: #0f172a;
  --background-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #111827 100%);
  --foreground: #f8fafc;
  --card: rgba(30, 41, 59, 0.62);
  --card-foreground: #f8fafc;
  --popover: rgba(30, 41, 59, 0.86);
  --popover-foreground: #f8fafc;
  --primary: #60a5fa;
  --primary-foreground: #0f172a;
  --secondary: rgba(51, 65, 85, 0.52);
  --secondary-foreground: #f8fafc;
  --muted: rgba(51, 65, 85, 0.42);
  --muted-foreground: #94a3b8;
  --accent: rgba(139, 92, 246, 0.18);
  --accent-foreground: #c4b5fd;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: rgba(148, 163, 184, 0.16);
  --input: rgba(148, 163, 184, 0.18);
  --ring: #60a5fa;
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.32);
}

body {
  min-height: 100vh;
  background: var(--background);
  background-image: var(--background-gradient);
  background-attachment: fixed;
  color: var(--foreground);
}
```

## Reusable Glass Utilities

Use these as utilities, component classes, or Tailwind `@apply` equivalents depending on the project.

```css
.glass-card {
  background: var(--card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow);
}

.glass-card-hover {
  background: var(--card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  box-shadow: var(--glass-shadow);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.glass-card-hover:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.62);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12);
}

.dark .glass-card-hover:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.42);
}

.glass-header {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
}

.dark .glass-header {
  background: rgba(15, 23, 42, 0.72);
}

.glass-sidebar {
  background: var(--card);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid var(--glass-border);
}

.glass-button {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.34);
  transform: translateY(-1px);
}

.dark .glass-button {
  background: rgba(255, 255, 255, 0.06);
}

.dark .glass-button:hover {
  background: rgba(255, 255, 255, 0.11);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

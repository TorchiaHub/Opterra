---
name: glass-frontend
description: Use when building or redesigning frontend apps, dashboards, SaaS tools, landing pages, React/Next.js/Tailwind interfaces, or any UI that should default to a polished modern glassmorphism style with light and dark themes, Plus Jakarta Sans, lucide icons, translucent surfaces, and responsive production-quality interaction states.
---

# Glass Frontend

## Overview

Use this skill to make new frontend work default to a modern glassmorphism design system: light/dark themes, translucent surfaces, blue/violet accents, readable typography, compact app-first layouts, and production-ready responsive states.

When a target repo already has a design system, preserve its conventions and blend these rules into the existing tokens/components instead of replacing everything.

## Default Visual System

- Default font: `Plus Jakarta Sans` [`default`]; alternatives to offer when the user wants a different feel: `Inter` [neutral SaaS], `Geist` [technical/product], `Manrope` [friendly modern], or system sans [minimal dependency].
- Default theme: blue/violet glass with light and dark modes [`default: light + dark`]. Offer alternatives only when the user asks for theme options or the product domain clearly calls for it.
- Use `lucide-react` or the repo's existing icon library for action buttons and navigation icons.
- Use CSS variables for theme tokens, then consume them through Tailwind or component styles.
- Use glass only where it improves depth and grouping: primary panels, headers, sidebars, modals, active controls, and focused tool surfaces.
- Keep operational tools compact and scannable; avoid marketing-page spacing inside dashboards, editors, admin panels, and repeated workflows.
- Build light and dark themes from the start. Use a class-based dark mode (`.dark`) when the app has a theme toggle.

## Theme Options

When the user asks what themes are available, present a short list and mark defaults in brackets:

- Glass Blue/Violet [`default`, light + dark]: slate/sky background, blue primary, violet accent, translucent white/slate panels.
- Glass Emerald: neutral slate surfaces with emerald primary for healthcare, finance, growth, or status-heavy products.
- Glass Rose/Indigo: warmer product UI with rose highlights and indigo actions.
- Glass Monochrome: mostly black/white/slate with one restrained accent for serious admin or developer tools.
- Domain theme: adapt hue, density, and imagery to the product while keeping the same glass tokens, dark mode, accessibility, and app-shell structure.

Do not stop implementation just to ask about themes unless the user explicitly wants to choose. Use Glass Blue/Violet by default.

## Theme Tokens And Utilities

When you need copyable CSS for the default token baseline and reusable glass utility classes, read:

- `references/theme-tokens-and-utilities.md`

Load that reference only when the task involves implementing or refactoring theme CSS.

## Theme Behavior

- In Next.js/React, wrap the app with a theme provider that stores `light | dark | system`, resolves system preference, and toggles `.light` or `.dark` on `<html>`.
- Use `suppressHydrationWarning` on `<html>` when theme is applied client-side.
- Prevent broken first paint: use an inline theme script or hide children until mounted if the app cannot safely SSR the resolved theme.
- Include both an icon toggle and, when settings space allows, a segmented `Light / Dark / Auto` control.
- Add `aria-label` to icon-only toggles and preserve keyboard focus rings.

## Next.js Implementation Notes

- For new Next.js apps, prefer the latest stable App Router stack available in the workspace. A known good modern baseline is Next.js 16, React 19, TypeScript 5, Tailwind, and `lucide-react`, unless the existing repo pins an older compatible stack.
- Keep dependency upgrades explicit. Do not run `npm audit fix --force` as a default repair step; it can downgrade major packages or create peer dependency conflicts. Inspect audit output first and update only the intended packages.
- Use `npm run lint` as a lightweight type/style gate when the repo defines it. A practical default for generated apps is `tsc --noEmit`.
- For Next.js 16 builds, `next build` may use Turbopack. If Turbopack hits an environment-specific issue, verify the app with `npx next build --webpack` before treating the code as broken.

## Default Auth Pattern

If the user does not specify auth requirements, include Firebase Google sign-in as the default optional social login pattern when the app needs user identity.

- Auth must be non-blocking by default: do not protect routes, redirect anonymous users, or prevent page access unless the user explicitly asks for gated routes.
- Show sign-in as an optional enhancement: personalize data, save user-specific content, or unlock actions that truly require an account.
- For actions requiring identity, render inline prompts or disabled/alternate action states instead of blocking the whole route.
- Use Google as the default provider and Firebase Auth as the default implementation option for React/Next apps.
- Keep auth environment-driven. Never hardcode Firebase keys beyond public env variable reads.
- Include a README or README section in generated projects explaining how to configure Firebase Google auth. Use `references/firebase-google-auth-readme.md` as the starter.

## App Shell Pattern

For authenticated tools, dashboards, editors, and SaaS apps, use a consistent shell:

- Sidebar: fixed or sticky glass sidebar with compact icon+label navigation, active route highlight, collapsible desktop mode, blurred mobile overlay, and a top brand mark.
- Header: glass header on mobile or content-heavy pages, with menu button, page title, theme toggle, and primary action.
- Auth entry: sign-in panels should use a glass card, Google provider button, short trust/context copy, visible loading/error state, and return-url handling only when the user has asked for gated flows.
- Profile controls: place a compact user profile area at the bottom of the sidebar or in the top-right header. Include avatar/initials, user name or email, plan/role when relevant, settings/profile link, theme access, and sign out.
- Menus: use popover/dropdown surfaces with the same `--popover`, `--border`, blur, focus, and hover treatment as other glass UI.

For a concrete starter structure, read `references/app-shell-template.md`.
For auth setup documentation, read `references/firebase-google-auth-readme.md`.

## Artifact And Canvas Apps

Use this pattern only when the app creates, previews, or edits an output artifact such as slides, documents, reports, emails, dashboards, images, or diagrams.

- Keep the app chrome theme separate from the generated artifact's visual style when the artifact has its own design system.
- Prefer a canvas-first layout when the preview is the product: compact top toolbar, large centered preview, and overlay drawers for tools.
- Avoid permanent sidebars that squeeze fixed-aspect previews unless the workspace still has enough room.
- For input-heavy overlays, use a more opaque drawer surface than decorative glass panels so text fields remain readable.
- Dim and lightly blur the background behind drawers or modals when visual content sits underneath.
- For complex editors, use a hybrid inspector: structured Content fields, natural-language edit surface when relevant, Structure/layout controls, and optional Advanced/spec view.

## Layout Rules

- Build the actual usable interface as the first screen. Do not default to a generic landing page unless the user asks for one.
- Use glass panels for meaningful grouping; do not put cards inside cards.
- Keep cards at `8px` radius or less unless the surrounding app already uses larger radii; glass feature panels may use `12-16px` when they are top-level surfaces.
- Use stable dimensions for boards, toolbars, icon buttons, tiles, and counters so hover states and dynamic labels do not shift layout.
- Make text fit at mobile and desktop sizes. Do not scale font size with viewport width.
- Use restrained decoration. Avoid large decorative orbs, bokeh blobs, and one-note blue/purple screens; balance slate, white, blue, violet, and semantic colors.
- Use icons inside buttons for common actions. Add visible text only when the command would otherwise be unclear.

## Interaction States

Every generated frontend should include:

- Hover, active, disabled, loading, empty, error, and success states where relevant.
- Focus-visible rings using `--ring` and accessible contrast in both themes.
- Skeleton or shimmer loading only where it communicates progress without distracting from core content.
- Mobile navigation behavior for sidebars, dialogs, and tool-heavy screens.
- Browser verification for substantial UI work: inspect desktop and mobile, check dark/light themes, and confirm no text overlap or blank primary visuals.

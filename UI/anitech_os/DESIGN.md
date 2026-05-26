---
name: AniTech OS
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#b9c7e0'
  on-secondary: '#233144'
  secondary-container: '#3c4a5e'
  on-secondary-container: '#abb9d2'
  tertiary: '#2fd9f4'
  on-tertiary: '#00363e'
  tertiary-container: '#001b20'
  on-tertiary-container: '#008ea1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
  electric-cyan: '#22D3EE'
  soft-violet: '#A78BFA'
  pale-gold: '#FDE68A'
  deep-indigo: '#312E81'
  muted-charcoal: '#0F172A'
  azure-blue: '#3B82F6'
  subtle-magenta: '#D946EF'
typography:
  display-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  metadata:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  sidebar-collapsed: 80px
  content-margin: 40px
  gutter: 24px
  grid-unit: 8px
---

## Brand & Style

The design system embodies the "AniTech OS" philosophy: a premium, immersive media environment that feels like a high-end desktop application rather than a browser-based site. The brand is sophisticated, intelligent, and emotionally resonant, prioritizing "Media Immersion" over "Gamer RGB" tropes.

The aesthetic follows a **Cinematic Glassmorphism** style. It utilizes deep, atmospheric layering with controlled translucent surfaces to create depth without sacrificing clarity. Every element feels "expensive"—crafted with precision, subtle shadows, and a focus on content-first hierarchy. The personality is calm yet powerful, providing a stable "home" for users who spend thousands of hours within the application.

**Key Design Principles:**
- **Application-First:** Persistent navigation and modular utility panels (Discord/Spotify/Steam-inspired).
- **Immersive Depth:** Layers are separated by tonal shifts and backdrop blurs rather than aggressive borders.
- **Cinematic Focus:** Large-scale media visuals and tight, impactful typography.
- **Intelligence:** A layout that feels aware of user context, surfacing relevant metadata and social activity gracefully.

## Colors

The color palette is strictly dark-mode-first, centered on a foundation of **Deep Navy** and **Rich Slate Blue**. The goal is an atmospheric, "cinematic" environment where the interface recedes to allow anime artwork to shine.

- **Foundations:** Use `Primary (#0F172A)` for base backgrounds and `Neutral (#1E293B)` for secondary containers. `Deep Indigo` is reserved for subtle surface tints to provide warmth.
- **Accents:** `Electric Cyan` and `Azure Blue` are functional accents for progress and primary actions. `Soft Violet` and `Subtle Magenta` are used for secondary highlights (e.g., social notifications or genre tags).
- **Highlights:** `Pale Gold` is used sparingly for premium indicators, ratings, or "special edition" content.
- **Forbidden:** No flat black (#000000) or pure white (#FFFFFF). Use tinted neutrals to maintain the layered, sophisticated feel.

## Typography

The typographic system balances cinematic impact with extreme readability.

- **Headlines (Sora):** Used for anime titles and section headers. These feature tight tracking and bold weights to evoke a "movie poster" aesthetic.
- **Body (Hanken Grotesk):** A clean, contemporary sans-serif for descriptions and long-form content. It provides high legibility on dark backgrounds with generous line height.
- **System Labels (JetBrains Mono):** Used for technical metadata, timestamps, and "operating system" details (e.g., file sizes, episode numbers). This reinforces the "application/OS" feel.
- **Hierarchy:** Anime titles should always feel like the most important element on the page, followed by clear, muted metadata.

## Layout & Spacing

This design system uses an **Application-First Fixed Sidebar** model.

- **Structure:** A persistent left sidebar houses global navigation. The main content area uses a fluid grid that maintains a comfortable `40px` outer margin on desktop.
- **Modular Panels:** Content is organized into "Lanes" or "Zones" (Spotify-style). Each section should have consistent padding based on the `8px` grid unit.
- **Breakpoints:**
    - **Desktop (1440px+):** Sidebar + Main Content + Optional Right Context Panel.
    - **Tablet (768px - 1439px):** Sidebar collapses to icon-only (`80px`); Content reflows to 3-column grids.
    - **Mobile (<768px):** Sidebar becomes a bottom navigation bar or hidden drawer; single-column focus.
- **Guttering:** Maintain `24px` between cards to allow the background atmosphere to "breathe" through the gaps.

## Elevation & Depth

Hierarchy is established through **Backdrop Blurs** and **Tonal Layering** rather than traditional elevation.

- **Layer 0 (Base):** Deep Navy foundation.
- **Layer 1 (Panels):** Slightly lighter Slate Blue with a subtle `1px` inner border (white at 5% opacity) to define edges.
- **Layer 2 (Interactive/Glass):** Surfaces that float over content (sidebars, search overlays) use a `20px` backdrop-filter blur and `60%` opacity of the background color.
- **Shadows:** Use large, diffused "Ambient Shadows" (`0 20px 50px rgba(0,0,0,0.5)`) to lift active cards or modals. Avoid hard shadows.
- **Depth:** Hovering over a card should trigger a "Layered Scaling" effect—the card moves forward (scale 1.05) and its shadow deepens, creating a tactile, collectible feel.

## Shapes

The shape language is **Soft-Modern**.

- **General UI Elements:** Buttons, input fields, and small containers use a `0.5rem (8px)` radius.
- **Anime Cards:** Large media containers and posters use a `1rem (16px)` radius to emphasize the "collectible" aspect.
- **Avatars/Indicators:** Use full circles (pill-shaped) for user profiles and live status indicators to contrast against the geometric grid.

## Components

- **Anime Cards:** The core component. Must feature a high-aspect-ratio poster, a hidden hover-reveal overlay containing metadata (score, genre), and a discrete `2px` height progress bar at the bottom for "Continue Watching."
- **Sidebar Nav:** High-contrast icons with "Soft Violet" active states. Labels should be `label-sm` with slight letter spacing.
- **Buttons:**
    - **Primary:** Gradient background (Azure to Cyan), `rounded-lg`, with a soft glow effect on hover.
    - **Secondary:** Ghost style with `1px` border and subtle blur background.
- **Video Player:** Completely bespoke UI. Controls should be anchored to the bottom in a glassmorphic bar that fades out during inactivity. The "Seek Bar" uses the `Electric Cyan` accent.
- **Chips/Tags:** Used for genres or season info. `rounded-xl`, small font, low-contrast background (muted charcoal).
- **Interactive Progress:** Progress bars should be thin and elegant, utilizing a "pulse" animation during active loading.
- **Context Panels:** Right-side panels for "Watch Party" or "Comments" should be slightly more transparent than the main sidebar to signify secondary importance.
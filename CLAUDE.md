# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Substack Token Retrieval** application built with Next.js 16. It provides a multi-step authentication flow that simulates the Substack sign-in process, helping users obtain their Substack authentication tokens. The app includes email verification, optional two-factor authentication, and token display with copy-to-clipboard functionality.

## Development Commands

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Technology Stack

### Core Framework & Runtime
- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x (strict mode enabled)
- **Node.js**: 20 (CI/CD environment)
- **Package Manager**: pnpm

### Styling & Theming
- **Tailwind CSS**: v4.1.9 with @tailwindcss/postcss plugin
- **Tailwind Utilities**: tailwind-merge (^3.3.1), tailwind-animate (^1.0.7), tw-animate-css (1.3.3)
- **Class Utilities**: clsx (^2.1.1), class-variance-authority (^0.7.1)
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font)
- **Theme Support**: next-themes (^0.4.6) for dark mode

### UI Components & Icons
- **Radix UI**: Comprehensive component library (24+ primitives including accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, tooltip, popover, etc.)
- **Icon Library**: Lucide React (^0.454.0)
- **Component System**: shadcn/ui (New York style)
- **Additional Components**: embla-carousel (8.5.1), vaul (^1.1.2), react-resizable-panels (^2.1.7)

### Form Handling & Validation
- **Form Management**: react-hook-form (^7.60.0) with @hookform/resolvers (^3.10.0)
- **Schema Validation**: Zod (3.25.76)
- **Specialized Inputs**: input-otp (1.4.1) for OTP entry, react-day-picker (9.8.0) for dates

### Data & Utilities
- **Date Utilities**: date-fns (4.1.0)
- **Charts**: recharts (2.15.4)
- **Notifications**: sonner (^1.7.4)
- **Command Menu**: cmdk (1.0.4)

### Analytics & Monitoring
- **Analytics**: @vercel/analytics (1.3.1)

### Linting & Code Quality
- **ESLint**: 9 with Next.js TypeScript presets (core-web-vitals)
- **PostCSS**: ^8.5

## Project Structure

```
/
├── app/                          # Next.js App Router directory
│   ├── layout.tsx               # Root layout with metadata & font config
│   ├── page.tsx                 # Home page (renders SubstackTokenFlow)
│   ├── globals.css              # Global styles with Tailwind v4 directives & custom theme
│   └── favicon.ico
├── components/
│   ├── substack-token-flow.tsx  # Main 4-step authentication flow component
│   └── ui/                      # shadcn/ui components
│       ├── card.tsx             # Card component with variants
│       ├── button.tsx           # Button component with variants
│       └── input.tsx            # Input component
├── lib/
│   └── utils.ts                 # Utility functions (cn for class merging)
├── public/                      # Static assets (SVG files, icons)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .github/workflows/
│   └── nextjs.yml              # CI/CD for GitHub Pages deployment
├── Configuration Files:
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── eslint.config.mjs       # ESLint configuration
│   ├── postcss.config.mjs      # PostCSS configuration
│   ├── components.json         # shadcn/ui configuration
│   └── package.json            # Dependencies & scripts
└── Documentation:
    ├── README.md
    ├── CLAUDE.md               # This file
    ├── CODE_OF_CONDUCT.md
    ├── SECURITY.md
    └── LICENSE
```

## Main Application Component

### SubstackTokenFlow (`components/substack-token-flow.tsx`)

Client-side component implementing a 4-step authentication flow:

1. **Email Step** - User enters their email address
2. **Verification Step** - User enters a 6-digit verification code (auto-focus between inputs)
3. **Two-Factor Authentication** - Optional 2FA code entry with skip option
4. **Token Display** - Shows mock authentication token with:
   - Show/hide password toggle (Eye/EyeOff icons)
   - Copy-to-clipboard functionality with visual feedback
   - Security warning message

**Features:**
- State-managed progression through steps
- Automatic focus management for verification inputs
- Visual feedback for user actions (copy confirmation)
- Responsive design with mobile-first approach
- Uses Lucide React icons (Bookmark, Mail, Eye, EyeOff, Copy, Check)

## Key Configuration Details

### TypeScript (`tsconfig.json`)
- **Target**: ES2017
- **JSX**: react-jsx
- **Module Resolution**: bundler mode
- **Path Aliases**:
  - `@/*` → root directory
  - `@/components` → components
  - `@/lib` → lib
  - `@/hooks` → hooks
- **Strict Mode**: Enabled
- **Incremental Compilation**: Enabled

### ESLint (`eslint.config.mjs`)
- Next.js core-web-vitals preset
- Next.js TypeScript preset
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Tailwind CSS v4 (`postcss.config.mjs`)
- Uses modern @tailwindcss/postcss plugin
- No traditional tailwind.config.js file
- All theme configuration in `app/globals.css` using CSS variables
- Uses OKLch color space for modern color definitions

### Custom Theme (in `app/globals.css`)
**Substack-inspired color scheme:**
- **Light Mode**: Cream background (#FFF7F4) with dark text
- **Dark Mode**: Dark blue background with light text
- **Primary Color**: Substack orange (oklch(0.65 0.19 40) ~ #FF6719)
- CSS Variables for design tokens (colors, radius, sidebar, charts)

### shadcn/ui Configuration (`components.json`)
- **Style**: New York
- **Icon Library**: Lucide
- **Base Color**: Neutral
- **CSS File**: app/globals.css
- **Component Aliases**: Configured for components, lib, hooks

## Deployment & CI/CD

### GitHub Actions Workflow (`.github/workflows/nextjs.yml`)
Automated deployment to GitHub Pages:
- **Trigger**: Pushes to main branch or manual dispatch
- **Environment**: Ubuntu latest, Node.js 20, pnpm v10
- **Build Process**:
  1. Detects package manager (yarn/pnpm/npm)
  2. Installs dependencies
  3. Builds Next.js static site (outputs to `./out/`)
  4. Deploys to GitHub Pages

- **Permissions**: Read contents, write pages, write id-token

## Special Features

1. **Multi-step Form Flow**: State-managed progression through authentication steps
2. **Auto-focus Input Fields**: Automatic focus to next verification code input
3. **Token Visibility Toggle**: Show/hide password functionality
4. **Copy-to-Clipboard**: With visual feedback (icon change to checkmark for 2 seconds)
5. **Responsive Design**: Centered layout with mobile-first approach
6. **Dark Mode Support**: via next-themes with custom CSS variables
7. **Vercel Analytics**: Integrated for usage tracking
8. **Accessibility**: Proper form semantics and ARIA labels via Radix UI components

## Development Notes

- Project uses **pnpm** as the package manager
- TypeScript strict mode is enabled - maintain type safety
- Follow shadcn/ui component patterns when adding new UI components
- All color values use OKLch color space for better consistency
- Maintain the Substack-inspired design theme when making changes
- Test across both light and dark modes

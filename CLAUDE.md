# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router with TypeScript, React 19, and Tailwind CSS v4.

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

- **Framework**: Next.js 16.0.8 (App Router)
- **React**: 19.2.1
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font)
- **Linting**: ESLint 9 with Next.js config

## Project Structure

- `app/` - Next.js App Router directory
  - `page.tsx` - Home page component
  - `layout.tsx` - Root layout with font configuration
  - `globals.css` - Global styles and Tailwind directives
- TypeScript configuration uses path alias `@/*` pointing to root directory
- ESLint configured with Next.js TypeScript presets

## Key Configuration Notes

- **TypeScript**: Target is ES2017, JSX set to react-jsx
- **Tailwind**: Uses v4 with PostCSS integration (not the traditional config file)
- **Module Resolution**: Uses bundler mode resolution
- **Strict Mode**: Enabled in TypeScript configuration

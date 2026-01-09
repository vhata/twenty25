# twenty25

A modern full-stack web application built with:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Biome** - Fast linting and formatting
- **Vitest** - Unit testing framework
- **pnpm** - Fast, efficient package manager
- **Husky** - Git hooks for quality checks

## Prerequisites

- Node.js 20+
- pnpm (install: `npm install -g pnpm`)

## Quickstart

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run checks
pnpm check
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Common Commands

```bash
pnpm dev           # Start dev server (http://localhost:3000)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
pnpm lint          # Run Biome linter
pnpm format        # Format code with Biome
pnpm type-check    # Type check with TypeScript
pnpm check         # Run all checks (CI equivalent)
```

### Project Structure

```
src/
  app/              # Next.js App Router pages and layouts
    api/            # API routes
  components/       # React components
  lib/              # Utilities, types, helpers
  __tests__/        # Test files
public/             # Static assets
.claude/            # Claude Code configuration
```

## Server vs Client Components

Next.js 15 uses Server Components by default:

- **Server Components** (default): Better performance, no JavaScript sent to client
- **Client Components**: Use `'use client'` directive for interactivity, hooks, browser APIs

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Building for Production

```bash
# Build the project
pnpm build

# Run the production build locally
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

## Working with Claude Code

This repository includes a `.claude/CLAUDE.md` file with project-specific instructions for Claude Code, including:
- Commit message guidelines
- When to update CHANGELOG.md
- Next.js best practices (Server vs Client Components)
- Testing requirements

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT - see LICENSE file for details

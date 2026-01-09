# Claude Code Instructions for twenty25

This file contains project-specific instructions for Claude Code when working in this repository.

## Commit Guidelines

### Commit Frequency
- Make small, focused commits regularly rather than large, monolithic commits
- Each commit should represent a single logical change
- Commit after completing each distinct task or fix

### Commit Message Format
Use descriptive commit messages that explain both what changed and why:

```
Short summary (50 chars or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain the problem this commit solves and why this approach was taken.

- Bullet points are fine for listing multiple changes
- Reference issue numbers if applicable (#123)
```

Examples of good commit messages:
- `Add user authentication with NextAuth.js` (not just "add auth")
- `Optimize image loading with Next.js Image component` (not just "fix images")
- `Implement server-side data fetching for blog posts` (not just "add blog")

### What to Commit
- Always run `pnpm format` and `pnpm check` before committing
- Ensure all tests pass
- Ensure type checking passes
- Ensure the build succeeds
- Husky pre-commit hooks will enforce these automatically

## CHANGELOG.md Maintenance

### When to Update CHANGELOG.md
Update CHANGELOG.md for changes that affect users or developers of this project:

**Always update for:**
- New features or pages
- API route changes
- Bug fixes
- Breaking changes
- Security fixes
- Performance improvements
- Dependency updates (major versions)

**Don't update for:**
- Refactoring that doesn't change behavior
- Code formatting
- Documentation typos
- Internal test changes
- Build configuration tweaks

### How to Update CHANGELOG.md
1. Add entries under `## [Unreleased]` section
2. Use the appropriate category:
   - `### Added` - New features
   - `### Changed` - Changes in existing functionality
   - `### Deprecated` - Soon-to-be removed features
   - `### Removed` - Removed features
   - `### Fixed` - Bug fixes
   - `### Security` - Security fixes

3. Write clear, user-focused descriptions
4. Update CHANGELOG.md in the same commit as the change

Example:
```markdown
## [Unreleased]

### Added
- User profile page with SSR
- API endpoint for user data fetching

### Fixed
- Fix hydration mismatch in navigation component
```

## Next.js Best Practices

### Server vs Client Components
- **Default to Server Components** - Better performance, smaller bundles
- Use `'use client'` only when needed:
  - Component uses hooks (useState, useEffect, etc.)
  - Component uses browser APIs
  - Component needs event handlers

### File Organization
- **app/** - App Router pages and layouts
- **app/api/** - API routes
- **components/** - Reusable UI components
- **lib/** - Utility functions, helpers, types
- **public/** - Static assets

### Data Fetching
- Prefer Server Components with async/await
- Use fetch with Next.js caching: `fetch(url, { cache: 'force-cache' })`
- Use Server Actions for mutations
- Keep client-side fetching minimal

## Testing Requirements
- Write tests for components and utilities
- Test both server and client components appropriately
- Aim for >80% code coverage
- Run `pnpm test` before committing

## Code Style
- Use TypeScript strict mode (enforced)
- Prefer Server Components over Client Components
- Use Tailwind CSS for styling
- Keep components focused and small (<200 lines)
- Extract business logic into lib/ utilities

## Review Before Committing
Before each commit, verify:
1. [ ] Code is formatted (`pnpm format`)
2. [ ] Linting passes (`pnpm lint`)
3. [ ] Type checking passes (`pnpm type-check`)
4. [ ] Tests pass (`pnpm test`)
5. [ ] Build succeeds (`pnpm build`)
6. [ ] CHANGELOG.md updated if appropriate
7. [ ] Commit message is descriptive

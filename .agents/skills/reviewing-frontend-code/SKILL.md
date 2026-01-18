---
name: reviewing-frontend-code
description: Reviews React and Next.js code for performance, accessibility, security, and adherence to project standards. Use when asked to review frontend PRs or components.
---

# Reviewing Frontend Code

This skill provides comprehensive review for frontend code within the VeXeViet project.

## Review Checklist

### 1. Design & Layout
- **Responsiveness**: Does it work on mobile, tablet, and desktop?
- **Tailwind Usage**: Are classes optimized? No arbitrary values unless necessary.
- **Components**: Proper use of `shadcn/ui` and base components.

### 2. Code Quality & Logic
- **TypeScript**: Strict typing used? No `any`.
- **Hooks**: Correct use of `useEffect`, `useMemo`, `useCallback`.
- **State Management**: Is state lifted properly or kept local where needed?

### 3. Performance & Accessibility
- **Images**: Using `next/image` with proper sizes?
- **ARIA**: Correct labels and roles for screen readers?
- **Bundle Size**: Any heavy libraries imported unnecessarily?

### 4. Standards
- **Imports**: Using absolute paths (`@/...`)?
- **Exports**: Named exports preferred.
- **Naming**: PascalCase for components, camelCase for hooks/functions.

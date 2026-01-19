---
name: styling-with-tailwindcss
description: Provides standards and utilities for styling with Tailwind CSS. Use when building or refactoring UI components.
---

# Styling with Tailwind CSS

Guidelines for implementing responsive, maintainable, and efficient styles using Tailwind CSS.

## Core Principles

- **Utility-First**: Use Tailwind classes directly in HTML/JSX. Avoid custom CSS files.
- **Responsive Design**: Mobile-first approach using `sm:`, `md:`, `lg:`, `xl:`.
- **Consistency**: Use the project's `tailwind.config.js` for theme values (colors, spacing, typography).
- **Organization**: Use `clsx` or `tailwind-merge` for conditional class logic.

## Common Patterns

### Responsive Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

### Conditional Classes
```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button className={cn('px-4 py-2', isActive ? 'bg-blue-500' : 'bg-gray-200')}>
  Click me
</button>
```

## Best Practices

1. **Avoid Arbitrary Values**: Prefer theme classes (e.g., `w-4` over `w-[16px]`).
2. **Component Abstraction**: If a set of classes is reused frequently, create a React component instead of a CSS class.
3. **Hover/Focus States**: Always include feedback for interactive elements: `hover:bg-opacity-80 focus:ring-2`.
4. **Dark Mode**: Use `dark:` prefix for dark mode support if enabled.

## Tooling
- **Tailwind CSS IntelliSense**: Use the VS Code extension for autocomplete.
- **Prettier Plugin**: Automatically sorts Tailwind classes for readability.

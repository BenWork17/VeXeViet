---
name: typescript-strict
description: Enforces strict TypeScript rules and patterns. Use when refactoring code to be type-safe or fixing TS errors.
---

# TypeScript Strict

Enforces strict TypeScript patterns and safety.

## Core Principles

- **No `any`**: Use `unknown` or specific types.
- **Strict Null Checks**: Explicitly handle `null` and `undefined`.
- **Exhaustive Checks**: Use `never` for exhaustive switch/if-else.
- **Type Guards**: Use `is` for custom type guards.
- **Branded Types**: For critical IDs and values.

## Workflows

### 1. Converting to Strict
- Add `"strict": true` to `tsconfig.json`.
- Fix errors service by service.
- Use `get_diagnostics` to find issues.

### 2. Fixing `any`
- Trace the data source.
- Create interfaces/types for external data.
- Use Zod for runtime validation if needed.

## Common Patterns

### Exhaustive Switch
```typescript
type Status = 'open' | 'closed';
switch (status) {
  case 'open': ...
  case 'closed': ...
  default:
    const _exhaustiveCheck: never = status;
    return _exhaustiveCheck;
}
```

### Type Guard
```typescript
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}
```

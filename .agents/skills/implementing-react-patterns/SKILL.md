---
name: implementing-react-patterns
description: Provides guidance on React design patterns like Composition, Render Props, and Custom Hooks. Use when architecting complex UI components.
---

# Implementing React Patterns

Advanced patterns and best practices for building scalable React 18+ applications.

## Core Patterns

### 1. Component Composition
Avoid prop drilling by passing components as props or using `children`.
```tsx
function Parent({ children }) {
  return <div className="p-4 border">{children}</div>;
}
```

### 2. Custom Hooks
Extract reusable logic into standalone hooks.
```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  // ... fetching logic
  return { data };
}
```

### 3. Compound Components
Manage shared state among a set of related components.
```tsx
<Select>
  <Select.Option value="1">Option 1</Select.Option>
  <Select.Option value="2">Option 2</Select.Option>
</Select>
```

## State Management

- **Local State**: Use `useState` for simple, component-specific state.
- **Complex State**: Use `useReducer` for state with multiple transitions.
- **Global State**: Use Context API or libraries like Zustand/Redux for app-wide state.

## Performance Optimization

- **`useMemo`**: Memoize expensive calculations.
- **`useCallback`**: Memoize function references passed to child components.
- **`React.memo`**: Prevent unnecessary re-renders of functional components.

## Best Practices

1. **Keep Components Small**: One component should do one thing.
2. **Typescript**: Always define interfaces for Props and State.
3. **Error Boundaries**: Wrap critical UI sections to catch runtime errors.
4. **Hooks Rules**: Only call hooks at the top level and within React functions.

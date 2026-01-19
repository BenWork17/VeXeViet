# Dark Mode Implementation Guide

> **Status:** PI 1 - Foundation Phase  
> **Last Updated:** 2026-01-19  
> **Owner:** Frontend Team (Team 1)

---

## 📋 Overview

VeXeViet sử dụng **Tailwind CSS Dark Mode** với chiến lược `class` để quản lý chế độ sáng/tối. Người dùng có thể chuyển đổi thủ công hoặc theo hệ thống.

---

## 🎨 Design Tokens

### Color Palette

```typescript
// Light Mode (Default)
background: 'white'           // Nền chính
foreground: 'slate-900'       // Chữ chính
primary: '#8B0000'            // Đỏ chủ đạo
secondary: '#FF6B35'          // Cam phụ
muted: 'slate-50'             // Nền phụ
border: 'slate-200'           // Viền

// Dark Mode
background: 'zinc-950'        // Nền tối
foreground: 'white'           // Chữ sáng
primary: '#8B0000'            // Giữ nguyên
secondary: '#FF6B35'          // Giữ nguyên
muted: 'zinc-900'             // Nền phụ tối
border: 'zinc-800'            // Viền tối
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Sử dụng class strategy
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#8B0000',
          foreground: '#FFFFFF',
        },
        // ... more colors
      },
    },
  },
};
```

### CSS Variables

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;          /* white */
    --foreground: 222.2 84% 4.9%;     /* slate-900 */
    --primary: 0 100% 27%;            /* #8B0000 */
    --secondary: 14 100% 60%;         /* #FF6B35 */
    --border: 214.3 31.8% 91.4%;      /* slate-200 */
    --muted: 210 40% 96.1%;           /* slate-50 */
  }

  .dark {
    --background: 240 10% 3.9%;       /* zinc-950 */
    --foreground: 0 0% 98%;           /* white */
    --border: 240 3.7% 15.9%;         /* zinc-800 */
    --muted: 240 5.9% 10%;            /* zinc-900 */
  }
}
```

---

## 🛠️ Implementation

### 1. Theme Provider

```typescript
// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="vexeviet-theme"
    >
      {children}
    </ThemeProvider>
  );
}
```

### 2. Theme Toggle Component

```typescript
// components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

### 3. Prevent Flash of Unstyled Content (FOUC)

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('vexeviet-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 📝 Coding Conventions

### ✅ DO: Use Semantic Class Names

```tsx
// ✅ Good: Responsive to dark mode
<div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
  <h1 className="text-slate-900 dark:text-white">Title</h1>
  <p className="text-slate-600 dark:text-slate-400">Description</p>
</div>

// ✅ Good: Use border with dark mode support
<div className="border-4 border-slate-200 dark:border-zinc-700">
  Content
</div>

// ✅ Good: Use background with transparency
<div className="bg-white/10 dark:bg-white/5 backdrop-blur-md">
  Glass effect
</div>
```

### ❌ DON'T: Hardcode Colors

```tsx
// ❌ Bad: Hardcoded white text (invisible in light mode)
<h1 className="text-white">Title</h1>

// ❌ Bad: No dark mode variant
<div className="bg-slate-200 text-gray-900">
  Content
</div>

// ❌ Bad: Using arbitrary values without dark variant
<div className="bg-[#FFFFFF] text-[#000000]">
  Content
</div>
```

### 🎯 Best Practices

#### 1. **Text Colors**

```tsx
// Primary text
className="text-slate-900 dark:text-white"

// Secondary text
className="text-slate-600 dark:text-slate-400"

// Muted text
className="text-slate-500 dark:text-slate-500"

// Accent text (always visible)
className="text-primary" // #8B0000 works on both themes
```

#### 2. **Background Colors**

```tsx
// Main background
className="bg-white dark:bg-zinc-950"

// Card background
className="bg-slate-50 dark:bg-zinc-900"

// Hover background
className="hover:bg-slate-100 dark:hover:bg-zinc-800"

// Overlay with blur
className="bg-white/10 dark:bg-white/5 backdrop-blur-md"
```

#### 3. **Borders**

```tsx
// Standard border
className="border-4 border-slate-200 dark:border-zinc-700"

// Subtle border
className="border border-gray-100 dark:border-zinc-800"

// Accent border (on hover)
className="border-gray-200 hover:border-primary dark:border-zinc-700 dark:hover:border-primary"
```

#### 4. **Shadows**

```tsx
// Light shadow (visible in light mode)
className="shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-none"

// Prominent shadow
className="shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"

// Colored shadow (always visible)
className="shadow-[0_20px_60px_rgba(139,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(139,0,0,0.3)]"
```

---

## 🧩 Component Examples

### Hero Section

```tsx
<section className="relative min-h-[70vh] bg-white dark:bg-zinc-950">
  {/* Background decorations */}
  <div className="absolute top-0 right-0 w-2/3 h-full bg-primary/10 dark:bg-primary/20 skew-x-12" />
  
  {/* Content */}
  <div className="container mx-auto px-4 relative z-10">
    <h1 className="text-7xl font-bold text-slate-900 dark:text-white">
      Sải bước <span className="text-secondary">Việt Nam</span>
    </h1>
    <p className="text-xl text-slate-700 dark:text-gray-300">
      Khám phá hành trình đẳng cấp
    </p>
  </div>
</section>
```

### Search Form

```tsx
<div className="bg-blue-600 rounded-[2.5rem] p-2 shadow-xl border-4 border-blue-700">
  <div className="bg-white dark:bg-zinc-900 rounded-[1.8rem] p-10 border-4 border-slate-200 dark:border-zinc-700">
    <input
      className="w-full bg-slate-50 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 
                 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                 focus:border-primary rounded-2xl px-5 py-4"
      placeholder="Điểm đi..."
    />
  </div>
</div>
```

### Route Card

```tsx
<div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border-4 border-gray-200 dark:border-zinc-700 
                hover:border-primary dark:hover:border-primary shadow-lg p-8">
  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
    Sao Viet Express
  </h3>
  <p className="text-slate-600 dark:text-slate-400">
    2h 30m • VIP Limousine
  </p>
  <div className="bg-slate-50 dark:bg-zinc-800 rounded-3xl p-6 border border-gray-50 dark:border-zinc-700">
    <span className="text-3xl font-black text-gray-900 dark:text-white">21:00</span>
  </div>
</div>
```

### Button

```tsx
// Primary button (always high contrast)
<Button className="bg-slate-900 dark:bg-white text-white dark:text-black 
                   hover:bg-primary dark:hover:bg-primary dark:hover:text-white">
  Đăng nhập
</Button>

// Outline button
<Button className="border-2 border-slate-300 dark:border-white/30 
                   text-slate-900 dark:text-white
                   hover:bg-slate-900 dark:hover:bg-white 
                   hover:text-white dark:hover:text-gray-900">
  Tìm hiểu thêm
</Button>
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Toggle theme từ light → dark → light
- [ ] Reload trang (theme phải persist)
- [ ] Kiểm tra tất cả pages: Home, Search, Login, Profile
- [ ] Test responsive (mobile + desktop)
- [ ] Test system preference (OS dark mode)
- [ ] Kiểm tra không có flash (FOUC)

### Visual Regression

```bash
# Chụp screenshots ở cả 2 chế độ
npm run test:visual -- --theme=light
npm run test:visual -- --theme=dark
```

### Accessibility

```bash
# Contrast ratio phải ≥ 4.5:1 (WCAG AA)
npm run test:a11y
```

---

## 📊 Color Contrast Matrix

| Element | Light Mode | Dark Mode | Contrast Ratio |
|---------|-----------|-----------|----------------|
| **Body text** | `slate-900` on `white` | `white` on `zinc-950` | 17.8:1 ✅ |
| **Secondary text** | `slate-600` on `white` | `slate-400` on `zinc-950` | 7.2:1 ✅ |
| **Primary button** | `white` on `#8B0000` | `white` on `#8B0000` | 8.5:1 ✅ |
| **Border** | `slate-200` on `white` | `zinc-700` on `zinc-950` | 1.2:1 ⚠️ (decorative) |

---

## 🚨 Common Pitfalls

### 1. White Text in Light Mode

```tsx
// ❌ Problem: White text invisible on white background
<h1 className="text-white">Title</h1>

// ✅ Solution: Add dark mode variant
<h1 className="text-slate-900 dark:text-white">Title</h1>
```

### 2. Missing Border Variants

```tsx
// ❌ Problem: Light border invisible in dark mode
<div className="border border-gray-100">Content</div>

// ✅ Solution: Add dark border
<div className="border border-gray-100 dark:border-zinc-800">Content</div>
```

### 3. Hardcoded Background Images

```tsx
// ❌ Problem: Bright image in dark mode
<div style={{ backgroundImage: 'url(/hero-light.jpg)' }}>

// ✅ Solution: Use CSS with dark variant
<div className="bg-[url(/hero-light.jpg)] dark:bg-[url(/hero-dark.jpg)]">
```

### 4. Shadow Visibility

```tsx
// ❌ Problem: Shadow invisible in dark mode
<div className="shadow-lg">Content</div>

// ✅ Solution: Adjust shadow for dark mode
<div className="shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
  Content
</div>
```

---

## 🔧 Utility Functions

### Check Current Theme

```typescript
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  return <div>Current theme: {currentTheme}</div>;
}
```

### Force Theme on Specific Page

```typescript
// app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function AdminLayout({ children }) {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    setTheme('dark'); // Force dark theme for admin
  }, [setTheme]);
  
  return <div>{children}</div>;
}
```

---

## 📚 Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

---

## 🎯 Future Enhancements (PI 2+)

- [ ] **Auto theme scheduling** (8am → light, 8pm → dark)
- [ ] **Per-component theme override** (admin panel always dark)
- [ ] **Theme presets** (high contrast, protanopia, deuteranopia)
- [ ] **Smooth theme transitions** (với Framer Motion)
- [ ] **Theme analytics** (track user preferences)

---

**Last Updated:** 2026-01-19  
**Next Review:** PI 2 Planning (Week 11)  
**Document Owner:** Frontend Team Lead

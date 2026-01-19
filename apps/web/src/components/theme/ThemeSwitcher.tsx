'use client';

import { useState } from 'react';
import { useThemeContext } from './ThemeProvider';
import { Theme } from '@/lib/hooks/useTheme';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

const themeOptions: { value: Theme; label: string; icon: JSX.Element }[] = [
  {
    value: 'light',
    label: 'Sáng',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Tối',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Hệ thống',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const currentOption = themeOptions.find((opt) => opt.value === theme) ?? themeOptions[2]!;

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpen(false); // Đóng popover sau khi chọn
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full w-10 h-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Chế độ hiển thị: ${currentOption.label}`}
        >
          {resolvedTheme === 'dark' ? themeOptions[1]!.icon : themeOptions[0]!.icon}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
        <div role="listbox" aria-label="Chọn chế độ hiển thị">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={theme === option.value}
              onClick={() => handleSelectTheme(option.value)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                theme === option.value 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
              {theme === option.value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

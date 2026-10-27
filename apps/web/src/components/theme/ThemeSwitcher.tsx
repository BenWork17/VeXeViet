'use client';

import { useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
import { Theme } from '@/lib/hooks/useTheme';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Sáng', icon: Sun },
  { value: 'dark', label: 'Tối', icon: Moon },
  { value: 'system', label: 'Hệ thống', icon: Monitor },
];

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const currentOption = themeOptions.find((opt) => opt.value === theme) ?? themeOptions[2]!;
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            'bg-card text-foreground',
            'transition-colors duration-150 motion-reduce:transition-none',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]',
          )}
          aria-label={`Chế độ hiển thị: ${currentOption.label}`}
        >
          <CurrentIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 rounded-md border border-border bg-card p-1 shadow-hn-md"
      >
        <div role="listbox" aria-label="Chọn chế độ hiển thị">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectTheme(option.value)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold',
                  'transition-colors duration-150 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125]',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <OptionIcon className="h-4 w-4" aria-hidden="true" />
                <span>{option.label}</span>
                {isSelected && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

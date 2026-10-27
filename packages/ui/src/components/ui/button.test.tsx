import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('renders primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('hover:bg-primary-deep');
    expect(button.className).toContain('text-primary-foreground');
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-primary');
    expect(button.className).toContain('bg-accent');
    expect(button.className).toContain('text-primary');
  });

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
    expect(button.className).toContain('border-primary');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:bg-muted');
  });

  it('renders danger variant', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('hover:bg-error-ink');
  });

  it('uses the 8px radius and no active scale', () => {
    render(<Button>Radius</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('rounded-md');
    expect(button.className).not.toContain('rounded-xl');
    expect(button.className).not.toContain('active:scale-95');
  });

  it('renders small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-[34px]');
    expect(button.className).toContain('text-[14px]');
    expect(button.className).toContain('px-[14px]');
  });

  it('renders medium size by default', () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-[42px]');
    expect(button.className).toContain('text-[16px]');
    expect(button.className).toContain('px-[20px]');
  });

  it('renders large size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-[50px]');
    expect(button.className).toContain('text-[18px]');
    expect(button.className).toContain('px-[28px]');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });
});

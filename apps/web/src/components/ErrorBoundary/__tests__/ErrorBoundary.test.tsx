import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error: Component crashed');
  }
  return <div>Normal render</div>;
};

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Suppress console.error in tests (expected errors)
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Rendering', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show error UI when component works', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal render')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch component errors and show fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText('Normal render')).not.toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/we're sorry, but something unexpected happened/i)).toBeInTheDocument();
    });

    it('should show reload button in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('should show report issue button in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report issue/i });
      expect(reportButton).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback component', () => {
      const CustomFallback = () => <div>Custom error UI</div>;

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('should pass error to custom fallback via render prop', () => {
      const CustomFallback = ({ error }: { error: Error }) => (
        <div>Error: {error.message}</div>
      );

      render(
        <ErrorBoundary
          fallback={(error) => <CustomFallback error={error} />}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error: component crashed/i)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should send error to Sentry', async () => {
      const { captureException } = await import('@sentry/nextjs');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Test error'),
        })
      );
    });

    it('should include component stack in error report', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <div>
            <ThrowError shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Reset Functionality', () => {
    it('should reset error state when reset button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Reset error boundary
      const resetButton = screen.getByRole('button', { name: /reload page/i });
      resetButton.click();

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
      expect(screen.getByText('Normal render')).toBeInTheDocument();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should catch errors at the nearest boundary', () => {
      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <div>Outer content</div>
          <ErrorBoundary fallback={<div>Inner error</div>}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
      
      // Outer content should still render
      expect(screen.getByText('Outer content')).toBeInTheDocument();
    });
  });

  describe('Different Error Types', () => {
    it('should handle TypeError', () => {
      const ThrowTypeError = () => {
        const obj: any = null;
        obj.method(); // TypeError
        return <div>Never rendered</div>;
      };

      render(
        <ErrorBoundary>
          <ThrowTypeError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle ReferenceError', () => {
      const ThrowReferenceError = () => {
        // @ts-ignore
        undefinedVariable.toString(); // ReferenceError
        return <div>Never rendered</div>;
      };

      render(
        <ErrorBoundary>
          <ThrowReferenceError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should handle custom errors', () => {
      const ThrowCustomError = () => {
        throw new Error('Custom error message');
      };

      render(
        <ErrorBoundary>
          <ThrowCustomError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error in Event Handlers', () => {
    it('should NOT catch errors in event handlers (expected behavior)', () => {
      const ComponentWithEventHandler = () => {
        const handleClick = () => {
          throw new Error('Event handler error');
        };

        return <button onClick={handleClick}>Click me</button>;
      };

      render(
        <ErrorBoundary>
          <ComponentWithEventHandler />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /click me/i });
      
      // Click should throw error (not caught by boundary)
      expect(() => button.click()).toThrow();
      
      // Error boundary should NOT show error UI
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Production vs Development', () => {
    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error details should be visible
      expect(screen.getByText(/test error: component crashed/i)).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Only generic message shown
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/test error: component crashed/i)).not.toBeInTheDocument();
    });
  });
});

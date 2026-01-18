import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../ToastContext';

// Test component that uses toast
const TestComponent = () => {
  const { toast } = useToast();

  return (
    <div>
      <button onClick={() => toast.success({ title: 'Success', message: 'Operation completed' })}>
        Show Success
      </button>
      <button onClick={() => toast.error({ title: 'Error', message: 'Operation failed' })}>
        Show Error
      </button>
      <button onClick={() => toast.warning({ title: 'Warning', message: 'Be careful' })}>
        Show Warning
      </button>
      <button onClick={() => toast.info({ title: 'Info', message: 'FYI' })}>
        Show Info
      </button>
    </div>
  );
};

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('Toast Notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Toast Display', () => {
    it('should show success toast', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show success/i });
      await user.click(button);

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('should show error toast', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show error/i });
      await user.click(button);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Operation failed')).toBeInTheDocument();
    });

    it('should show warning toast', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show warning/i });
      await user.click(button);

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Be careful')).toBeInTheDocument();
    });

    it('should show info toast', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show info/i });
      await user.click(button);

      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('FYI')).toBeInTheDocument();
    });
  });

  describe('Toast Auto-Dismiss', () => {
    it('should auto-dismiss success toast after 3 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show success/i });
      await user.click(button);

      expect(screen.getByText('Success')).toBeInTheDocument();

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('should auto-dismiss error toast after 7 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show error/i });
      await user.click(button);

      expect(screen.getByText('Error')).toBeInTheDocument();

      // 5 seconds - should still be visible
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('Error')).toBeInTheDocument();

      // 7 seconds - should disappear
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
      });
    });

    it('should auto-dismiss warning toast after 5 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show warning/i });
      await user.click(button);

      expect(screen.getByText('Warning')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Warning')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual Dismiss', () => {
    it('should dismiss toast when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show success/i });
      await user.click(button);

      expect(screen.getByText('Success')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });

    it('should prevent auto-dismiss when hovered', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      const button = screen.getByRole('button', { name: /show success/i });
      await user.click(button);

      const toast = screen.getByText('Success').closest('[role="alert"]');
      expect(toast).toBeInTheDocument();

      // Hover over toast
      await user.hover(toast!);

      // Fast-forward past auto-dismiss time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Toast should still be visible (paused)
      expect(screen.getByText('Success')).toBeInTheDocument();

      // Unhover
      await user.unhover(toast!);

      // Now it should dismiss
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Toasts (Queue)', () => {
    it('should show multiple toasts in queue', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      // Trigger 3 toasts
      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));
      await user.click(screen.getByRole('button', { name: /show warning/i }));

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should limit visible toasts to 3', async () => {
      const user = userEvent.setup({ delay: null });
      
      const MultipleToasts = () => {
        const { toast } = useToast();

        return (
          <button
            onClick={() => {
              toast.info({ title: 'Toast 1', message: 'Message 1' });
              toast.info({ title: 'Toast 2', message: 'Message 2' });
              toast.info({ title: 'Toast 3', message: 'Message 3' });
              toast.info({ title: 'Toast 4', message: 'Message 4' });
            }}
          >
            Show 4 Toasts
          </button>
        );
      };

      renderWithToast(<MultipleToasts />);

      await user.click(screen.getByRole('button', { name: /show 4 toasts/i }));

      // Only first 3 should be visible
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
      expect(screen.queryByText('Toast 4')).not.toBeInTheDocument();
    });

    it('should show next toast in queue when one is dismissed', async () => {
      const user = userEvent.setup({ delay: null });

      const MultipleToasts = () => {
        const { toast } = useToast();

        return (
          <button
            onClick={() => {
              toast.info({ title: 'Toast 1', message: 'Message 1' });
              toast.info({ title: 'Toast 2', message: 'Message 2' });
              toast.info({ title: 'Toast 3', message: 'Message 3' });
              toast.info({ title: 'Toast 4', message: 'Message 4' });
            }}
          >
            Show 4 Toasts
          </button>
        );
      };

      renderWithToast(<MultipleToasts />);

      await user.click(screen.getByRole('button', { name: /show 4 toasts/i }));

      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.queryByText('Toast 4')).not.toBeInTheDocument();

      // Dismiss first toast
      const firstToast = screen.getByText('Toast 1').closest('[role="alert"]');
      const closeButton = firstToast!.querySelector('button[aria-label="close"]');
      await user.click(closeButton!);

      // Toast 4 should now appear
      await waitFor(() => {
        expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
        expect(screen.getByText('Toast 4')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Variants (Styling)', () => {
    it('should apply success styling', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const toast = screen.getByText('Success').closest('[role="alert"]');
      expect(toast).toHaveClass('bg-green-500'); // Adjust based on your styles
    });

    it('should apply error styling', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show error/i }));

      const toast = screen.getByText('Error').closest('[role="alert"]');
      expect(toast).toHaveClass('bg-red-500'); // Adjust based on your styles
    });

    it('should show correct icon for each variant', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      // Success icon
      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();

      // Error icon
      await user.click(screen.getByRole('button', { name: /show error/i }));
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('Toast with Actions', () => {
    it('should render action button if provided', async () => {
      const user = userEvent.setup({ delay: null });
      
      const ToastWithAction = () => {
        const { toast } = useToast();

        return (
          <button
            onClick={() =>
              toast.error({
                title: 'Error',
                message: 'Failed to save',
                action: {
                  label: 'Retry',
                  onClick: vi.fn(),
                },
              })
            }
          >
            Show Error with Action
          </button>
        );
      };

      renderWithToast(<ToastWithAction />);

      await user.click(screen.getByRole('button', { name: /show error with action/i }));

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call action callback when action button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const actionCallback = vi.fn();

      const ToastWithAction = () => {
        const { toast } = useToast();

        return (
          <button
            onClick={() =>
              toast.error({
                title: 'Error',
                message: 'Failed',
                action: {
                  label: 'Retry',
                  onClick: actionCallback,
                },
              })
            }
          >
            Show Toast
          </button>
        );
      };

      renderWithToast(<ToastWithAction />);

      await user.click(screen.getByRole('button', { name: /show toast/i }));
      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(actionCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" for screen readers', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for errors', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show error/i }));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-live="polite" for success/info', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA labels for close button', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithToast(<TestComponent />);

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message gracefully', async () => {
      const user = userEvent.setup({ delay: null });

      const EmptyMessage = () => {
        const { toast } = useToast();

        return (
          <button onClick={() => toast.success({ title: 'Success', message: '' })}>
            Show Empty
          </button>
        );
      };

      renderWithToast(<EmptyMessage />);

      await user.click(screen.getByRole('button', { name: /show empty/i }));

      expect(screen.getByText('Success')).toBeInTheDocument();
      // Message should not render if empty
      expect(screen.queryByText('')).not.toBeInTheDocument();
    });

    it('should handle very long messages', async () => {
      const user = userEvent.setup({ delay: null });

      const LongMessage = () => {
        const { toast } = useToast();

        return (
          <button
            onClick={() =>
              toast.error({
                title: 'Error',
                message: 'This is a very long error message that should be truncated or wrapped properly to avoid breaking the layout of the toast notification component',
              })
            }
          >
            Show Long
          </button>
        );
      };

      renderWithToast(<LongMessage />);

      await user.click(screen.getByRole('button', { name: /show long/i }));

      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      // Should not overflow container
      expect(toast).toHaveStyle({ maxWidth: expect.any(String) });
    });
  });
});

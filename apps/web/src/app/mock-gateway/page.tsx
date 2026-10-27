'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Landmark } from 'lucide-react';

function MockGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);

  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Auto-redirect countdown for testing
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSuccess = () => {
    const resultUrl = new URL('/booking/payment/result', window.location.origin);
    resultUrl.searchParams.set('vnp_TransactionStatus', '00'); // VNPAY success code
    resultUrl.searchParams.set('transactionId', transactionId || '');
    resultUrl.searchParams.set('bookingId', bookingId || '');
    router.push(resultUrl.toString());
  };

  const handleFailure = () => {
    const resultUrl = new URL('/booking/payment/result', window.location.origin);
    resultUrl.searchParams.set('vnp_TransactionStatus', '01'); // VNPAY failure code
    resultUrl.searchParams.set('transactionId', transactionId || '');
    resultUrl.searchParams.set('bookingId', bookingId || '');
    resultUrl.searchParams.set('message', 'Giao dịch bị từ chối bởi ngân hàng');
    router.push(resultUrl.toString());
  };

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl text-error-ink">404</h1>
          <p className="text-muted-foreground">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-hn-md">
        {/* Mock Gateway Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-info-soft">
            <Landmark size={28} className="text-info-ink" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-display text-2xl text-foreground">Mock Payment Gateway</h1>
          <p className="text-sm text-muted-foreground">Simulation Environment (Development Only)</p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 space-y-3 rounded-md bg-muted p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono font-semibold text-foreground">{bookingId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold text-foreground">
              {amount ? parseInt(amount).toLocaleString('vi-VN') + ' ₫' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Method:</span>
            <span className="font-semibold text-foreground">{method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono text-xs text-muted-foreground">{transactionId}</span>
          </div>
        </div>

        {/* Simulation Instructions */}
        <div className="mb-6 rounded-md border-l-4 border-warning bg-warning-soft p-4">
          <p className="text-sm text-warning-ink">
            <strong>Test Mode:</strong> Choose an outcome to simulate the payment gateway response.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSuccess}
            className="w-full rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Simulate SUCCESS
          </button>

          <button
            onClick={handleFailure}
            className="w-full rounded-md bg-destructive px-6 py-3 font-semibold text-destructive-foreground transition-colors duration-150 hover:bg-error-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Simulate FAILURE
          </button>

          <button
            onClick={() => router.back()}
            className="w-full rounded-md border border-input px-6 py-3 font-semibold text-foreground transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
          >
            ← Cancel & Go Back
          </button>
        </div>

        {/* Auto-redirect info */}
        {countdown > 0 && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            This is a mock payment gateway for testing purposes only.
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MockGatewayContent />
    </Suspense>
  );
}

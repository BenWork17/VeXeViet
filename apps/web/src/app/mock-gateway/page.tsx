'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">404</h1>
          <p className="text-gray-600">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        {/* Mock Gateway Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl">🏦</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Mock Payment Gateway</h1>
          <p className="text-sm text-gray-500">Simulation Environment (Development Only)</p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-mono font-semibold text-gray-800">{bookingId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-800">
              {amount ? parseInt(amount).toLocaleString('vi-VN') + ' ₫' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Method:</span>
            <span className="font-semibold text-gray-800">{method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-mono text-xs text-gray-600">{transactionId}</span>
          </div>
        </div>

        {/* Simulation Instructions */}
        <div className="mb-6 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Test Mode:</strong> Choose an outcome to simulate the payment gateway response.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSuccess}
            className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            ✅ Simulate SUCCESS
          </button>

          <button
            onClick={handleFailure}
            className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            ❌ Simulate FAILURE
          </button>

          <button
            onClick={() => router.back()}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            ← Cancel & Go Back
          </button>
        </div>

        {/* Auto-redirect info */}
        {countdown > 0 && (
          <div className="mt-4 text-center text-xs text-gray-500">
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
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <MockGatewayContent />
    </Suspense>
  );
}

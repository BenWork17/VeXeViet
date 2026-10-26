'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

const steps = [
  { id: 'seats', label: 'Chọn chỗ' },
  { id: 'info', label: 'Thông tin' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'done', label: 'Hoàn tất' },
];

function resolveStep(pathname: string): number {
  if (pathname.startsWith('/booking/success') || pathname.startsWith('/booking/ticket')) {
    return 3;
  }
  if (pathname.startsWith('/booking/payment/result')) {
    return 3;
  }
  if (pathname.startsWith('/booking/payment')) {
    return 2;
  }
  if (pathname.startsWith('/booking/passenger-info')) {
    return 1;
  }
  if (/^\/booking\/[^/]+/.test(pathname)) {
    return 0;
  }
  return -1;
}

export function BookingSteps() {
  const pathname = usePathname();
  const currentStepIndex = resolveStep(pathname);
  const currentLabel = currentStepIndex >= 0 ? steps[currentStepIndex]?.label : null;

  return (
    <nav className="booking-flow" aria-label="Các bước đặt vé">
      <div className="booking-flow-inner">
        <ol className="booking-flow-list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const state = isCompleted ? 'completed' : isActive ? 'current' : 'upcoming';

            return (
              <li
                key={step.id}
                className="booking-flow-step"
                data-state={state}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="booking-step-marker" aria-hidden="true">
                  {isCompleted ? <Check size={15} strokeWidth={2.6} /> : index + 1}
                </span>
                <span className="booking-step-label">{step.label}</span>
                {isCompleted ? <span className="sr-only">đã hoàn tất</span> : null}
                {isActive ? <span className="sr-only">bước hiện tại</span> : null}
                {index < steps.length - 1 ? (
                  <span className="booking-step-rail" aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ol>
        {currentLabel ? (
          <p className="booking-flow-current">
            Bước {currentStepIndex + 1}/{steps.length}: {currentLabel}
          </p>
        ) : null}
      </div>
    </nav>
  );
}

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Check, User, CreditCard, Ticket, Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 'seats',
    label: 'Chọn chỗ',
    icon: Armchair,
    pattern: /^\/booking\/[^\/]+(\/|$)/,
  },
  {
    id: 'info',
    label: 'Thông tin',
    icon: User,
    pattern: /^\/booking\/passenger-info$/,
  },
  {
    id: 'payment',
    label: 'Thanh toán',
    icon: CreditCard,
    pattern: /^\/booking\/payment$/,
  },
  {
    id: 'done',
    label: 'Hoàn tất',
    icon: Ticket,
    pattern: /^\/booking\/(success|ticket)/,
  },
];

export function BookingSteps() {
  const pathname = usePathname();

  // Find the current step by checking from most specific to least specific
  const infoIndex = steps.findIndex(s => s.id === 'info');
  const paymentIndex = steps.findIndex(s => s.id === 'payment');
  const doneIndex = steps.findIndex(s => s.id === 'done');
  const seatsIndex = steps.findIndex(s => s.id === 'seats');

  let currentStepIndex = -1;
  if (steps[doneIndex].pattern.test(pathname)) currentStepIndex = doneIndex;
  else if (steps[paymentIndex].pattern.test(pathname)) currentStepIndex = paymentIndex;
  else if (steps[infoIndex].pattern.test(pathname)) currentStepIndex = infoIndex;
  else if (steps[seatsIndex].pattern.test(pathname)) currentStepIndex = seatsIndex;

  return (
    <div className="w-full bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2 group">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2",
                      isCompleted ? "bg-blue-600 border-blue-600 text-white" : 
                      isActive ? "border-blue-600 text-blue-600" : 
                      "border-gray-200 text-gray-400"
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:block",
                      isActive ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 bg-gray-100 hidden sm:block">
                    <div 
                      className={cn(
                        "h-full bg-blue-600 transition-all duration-500 ease-in-out",
                        isCompleted ? "w-full" : "w-0"
                      )} 
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';

export default function LegacyBookingPaymentResultRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (typeof val === 'string') {
      qs.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((v) => qs.append(key, v));
    }
  }
  const suffix = qs.toString();
  redirect(suffix ? `/payment/result?${suffix}` : '/payment/result');
}

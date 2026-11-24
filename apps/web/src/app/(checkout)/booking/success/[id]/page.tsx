import { redirect } from 'next/navigation';

export default function LegacyBookingSuccessRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/booking/ticket/${encodeURIComponent(params.id)}`);
}

import type { Locale } from './header.i18n'

export function MiniFlagBadge({ code }: { code: Locale }) {
  if (code === 'vi') {
    return (
      <svg
        viewBox="0 0 24 16"
        className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-2xs ring-1 ring-black/10"
        aria-hidden="true"
      >
        <rect width="24" height="16" fill="#DA251D" />
        <polygon
          points="12,3.2 13.1,6.6 16.7,6.6 13.8,8.7 14.9,12.1 12,10 9.1,12.1 10.2,8.7 7.3,6.6 10.9,6.6"
          fill="#FFCD00"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-2xs ring-1 ring-black/10"
      aria-hidden="true"
    >
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#FFFFFF" strokeWidth="3.2" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#FFFFFF" strokeWidth="4.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  )
}

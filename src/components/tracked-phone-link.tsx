"use client";

import { trackPhoneConversion } from "@/lib/analytics";

export function TrackedPhoneLink({ className, children, location, ariaLabel, phone }: { className?: string; children: React.ReactNode; location: string; ariaLabel?: string; phone: string }) {
  return <a href={`tel:${phone}`} className={className} aria-label={ariaLabel} onClick={() => trackPhoneConversion(location)}>{children}</a>;
}

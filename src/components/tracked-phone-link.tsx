"use client";

import { trackPhoneConversion } from "@/lib/analytics";

export function TrackedPhoneLink({ className, children, location, ariaLabel }: { className?: string; children: React.ReactNode; location: string; ariaLabel?: string }) {
  return <a href="tel:+380732610965" className={className} aria-label={ariaLabel} onClick={() => trackPhoneConversion(location)}>{children}</a>;
}

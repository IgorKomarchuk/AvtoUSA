"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function VehicleAnalytics({ id, title, platform, price }: { id: string; title: string; platform: string; price?: number | null }) {
  useEffect(() => {
    trackEvent("view_item", {
      currency: "USD",
      value: price ?? 0,
      items: [{ item_id: id, item_name: title, item_brand: platform }],
    });
  }, [id, platform, price, title]);
  return null;
}

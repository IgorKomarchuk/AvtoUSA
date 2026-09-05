"use client";

import Image from "next/image";
import { useState } from "react";
import type { VehiclePhotoData } from "@/lib/types";

export function VehicleGallery({ photos, title }: { photos: VehiclePhotoData[]; title: string }) {
  const safePhotos = photos.length ? photos : [{ url: "/assets/hero-car.png", alt: title, position: 0 }];
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-[#111311]">
        <Image src={safePhotos[active]?.url ?? safePhotos[0].url} alt={safePhotos[active]?.alt ?? title} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
      </div>
      {safePhotos.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{safePhotos.map((photo, index) => <button type="button" key={`${photo.url}-${index}`} onClick={() => setActive(index)} className={`premium-focus relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-xl border ${active === index ? "border-[#ff6b00]" : "border-white/10 opacity-60 hover:opacity-100"}`} aria-label={`Фото ${index + 1}`}><Image src={photo.url} alt="" fill sizes="112px" className="object-cover" /></button>)}</div>}
    </div>
  );
}

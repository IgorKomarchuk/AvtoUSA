import Image from "next/image";

export function BrandLogo({ admin = false, compact = false }: { admin?: boolean; compact?: boolean }) {
  return <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap sm:gap-2.5">
    <Image src="/assets/brilliantcars-mark.svg" alt="" width={compact ? 36 : 42} height={compact ? 24 : 28} className="h-auto w-[30px] shrink-0 sm:w-9" aria-hidden="true" />
    <span className={`${compact ? "text-[15px] sm:text-lg" : "text-lg sm:text-xl"} font-black tracking-[-.05em]`}>BRILLIANT<span className="text-[#ff6b00]">CARS</span></span>
    {admin && <span className="text-[10px] font-black tracking-[.12em] text-white/35">ADMIN</span>}
  </span>;
}

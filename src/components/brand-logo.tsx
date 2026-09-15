import Image from "next/image";

export function BrandLogo({ admin = false, compact = false }: { admin?: boolean; compact?: boolean }) {
  return <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap sm:gap-2">
    <Image
      src="/assets/brilliantcars-emblem-v2.png"
      alt=""
      width={96}
      height={48}
      className={`${compact ? "w-[52px] sm:w-[60px]" : "w-[62px] sm:w-[72px]"} h-auto shrink-0 object-contain`}
      aria-hidden="true"
      priority
    />
    <span className={`${compact ? "text-[15px] sm:text-lg" : "text-lg sm:text-xl"} font-black tracking-[-.05em]`}>BRILLIANT<span className="text-[#ff6b00]">CARS</span></span>
    {admin && <span className="text-[10px] font-black tracking-[.12em] text-slate-400">ADMIN</span>}
  </span>;
}

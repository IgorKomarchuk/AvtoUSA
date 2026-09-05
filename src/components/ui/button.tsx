import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function buttonStyles(variant: "primary" | "secondary" | "ghost" = "primary") {
  return cn(
    "premium-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-sm font-bold no-underline transition duration-200 active:scale-[.98]",
    variant === "primary" && "bg-[#ff6b00] text-white shadow-[0_15px_40px_rgba(255,107,0,.24)] hover:bg-[#ff7b1a] hover:-translate-y-0.5",
    variant === "secondary" && "border border-white/15 bg-white/[.06] text-white backdrop-blur-xl hover:border-white/30 hover:bg-white/[.1]",
    variant === "ghost" && "text-[#d6d8d1] hover:bg-white/[.07] hover:text-white",
  );
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(buttonStyles(), className)} {...props} />;
}

import { Info } from "lucide-react";

export function DemoNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[.08] px-4 py-3 text-sm text-amber-100/85" role="status">
      <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
      <p><strong className="text-amber-300">Демонстраційний каталог.</strong> Ці картки позначені DEMO та не є реальними аукціонними пропозиціями. Підключіть Apibara, щоб автоматично показувати живі дані.</p>
    </div>
  );
}

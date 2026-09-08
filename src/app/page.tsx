import { HomePage } from "@/components/home-page";
import { getVehicles } from "@/lib/vehicle-repository";
import { jsonLd } from "@/lib/seo";

export const revalidate = 1800;

export default async function Page() {
  const catalog = await getVehicles({ limit: 12 });
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ["Скільки часу займає доставка?", "Зазвичай 6–10 тижнів від купівлі до прибуття в Україну. Термін залежить від штату, порту та судноплавної лінії."],
      ["Чи можна купити авто без пошкоджень?", "Так. На аукціонах є автомобілі з різними статусами — від мінімальних косметичних дефектів до повністю цілих."],
      ["Як я контролюю процес?", "Ви отримуєте фото, документи й оновлення статусу на кожному ключовому етапі угоди."],
      ["Чи фіксується ціна заздалегідь?", "До торгів ми надаємо докладний розрахунок і погоджуємо максимальну ставку. Змінні ринкові витрати показуємо окремо."],
    ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faq) }} /><HomePage catalog={catalog} /></>;
}

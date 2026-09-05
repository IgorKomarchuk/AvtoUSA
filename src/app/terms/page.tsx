import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Публічна оферта", robots: { index: true, follow: true } };
export default function TermsPage() {
  return <LegalPage eyebrow="Правові документи" title="Публічна оферта"><p>Ця сторінка є структурним шаблоном, а не готовою юридичною офертою. Перед публічним запуском текст повинен бути підготовлений або затверджений юристом з урахуванням фактичної моделі договору та реквізитів компанії.</p><h2 className="text-xl font-bold text-white">Предмет послуг</h2><p>Підбір, перевірка, участь у торгах, організація оплати, логістики, митного оформлення, сертифікації та інших погоджених послуг.</p><h2 className="text-xl font-bold text-white">Попередні розрахунки</h2><p>Будь-який розрахунок на сайті є орієнтовним. Остаточна вартість визначається після вибору конкретного лота та погодження всіх складових.</p></LegalPage>;
}

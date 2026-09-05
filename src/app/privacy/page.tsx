import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Політика конфіденційності", robots: { index: true, follow: true } };
export default function PrivacyPage() {
  return <LegalPage eyebrow="Правові документи" title="Політика конфіденційності"><p>Ця сторінка є підготовленим шаблоном і має бути перевірена юристом та доповнена реквізитами фактичного оператора сайту перед запуском збору заявок.</p><h2 className="text-xl font-bold text-white">Які дані збираються</h2><p>Форма може передавати ім’я, номер телефону, обраний месенджер, інформацію про потрібний автомобіль і сторінку, з якої надіслано заявку.</p><h2 className="text-xl font-bold text-white">Мета обробки</h2><p>Дані використовуються виключно для опрацювання звернення, підготовки розрахунку й комунікації щодо підбору та доставки автомобіля.</p><h2 className="text-xl font-bold text-white">Контакти оператора</h2><p>До публічного запуску тут необхідно вказати юридичну назву, адресу та контакт для звернень щодо персональних даних.</p></LegalPage>;
}

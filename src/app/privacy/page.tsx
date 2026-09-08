import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Політика конфіденційності", robots: { index: true, follow: true } };
export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Правові документи" title="Політика конфіденційності">
      <p>Ця сторінка описує технічну обробку даних сайтом BRILLIANTCARS. Юридичні реквізити оператора мають бути перевірені та доповнені власником сайту.</p>
      <h2 className="text-xl font-bold text-white">Які дані збираються</h2>
      <p>Форма може передавати ім’я, номер телефону, обраний месенджер, інформацію про потрібний автомобіль і сторінку, з якої надіслано заявку.</p>
      <h2 className="text-xl font-bold text-white">Аналітика та реклама</h2>
      <p>За згодою відвідувача сайт може використовувати Google Analytics 4 і Google Ads для вимірювання переглядів сторінок, переглядів автомобілів, успішних заявок і кліків на телефон. Ім’я, номер телефону та інші дані з форми не передаються до Google через ці події.</p>
      <p>Google Consent Mode v2 передає стан згоди для analytics_storage, ad_storage, ad_user_data та ad_personalization. Вибір зберігається локально у браузері та може бути змінений через пункт «Налаштування cookie» у футері.</p>
      <h2 className="text-xl font-bold text-white">Мета обробки</h2>
      <p>Дані використовуються для опрацювання звернення, підготовки розрахунку, комунікації щодо автомобіля та оцінки ефективності реклами.</p>
      <h2 className="text-xl font-bold text-white">Контакти оператора</h2>
      <p><a href="mailto:racenkodmitrij8@gmail.com">racenkodmitrij8@gmail.com</a> · <a href="tel:+380732610965">+38 073 261 09 65</a></p>
    </LegalPage>
  );
}

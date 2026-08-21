import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export default function CaptureInbox() {
  return (
    <PlaceholderPage
      title="Capture Inbox"
      subtitle="Ручний імпорт скрінів, файлів і текстових документів для подальшого аналізу"
      icon={InboxOutlinedIcon}
      plan={[
        "Фаза 1 (наступна після пілоту SourceModulePanel): перетягнув файл → вручну обрав справу/сутність → підтвердив",
        "Фаза 2: clipboard monitoring — автовизначення відкритого реєстру й пропозиція парсингу",
        "Фаза 3: Vision AI аналіз скріншотів",
        "Фаза 4: пряма API-інтеграція з джерелами",
      ]}
    />
  );
}

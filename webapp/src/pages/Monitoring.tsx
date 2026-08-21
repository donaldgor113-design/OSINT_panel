import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export default function Monitoring() {
  return (
    <PlaceholderPage
      title="Моніторинг"
      subtitle="Списки спостереження, стрічка знахідок, виявлення ботоферм"
      icon={VisibilityOutlinedIcon}
      plan={[
        "Разовий запит («перевір цей нік/номер по відомих каналах») — вкладка в SourceModulePanel",
        "Безперервне спостереження: списки watch-list, алерти на сплески активності",
        "Виявлення нових фейкових акаунтів і мереж, задіяних у злочинній діяльності",
        "Кнопка «перекинути у справу» для релевантних знахідок",
      ]}
    />
  );
}

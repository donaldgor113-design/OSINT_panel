import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export default function Surveillance() {
  return (
    <PlaceholderPage
      title="Відеонагляд і польові операції"
      subtitle="Маршрути, плеєр, розпізнання авто/особи, доказова база"
      icon={VideocamOutlinedIcon}
      plan={[
        "Операційна консоль: карта маршруту + плеєр + таймкоди",
        "Прив'язка кадру до доказу/свідка в справі",
        "«Чи засвітилась особа/авто на камерах за період X» — як вкладка в SourceModulePanel",
        "Кілька шаблонів звіту залежно від задачі (маршрут / докази / свідки / розшук майна)",
      ]}
    />
  );
}

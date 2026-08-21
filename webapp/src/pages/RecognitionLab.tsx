import FaceRetouchingNaturalOutlinedIcon from "@mui/icons-material/FaceRetouchingNaturalOutlined";
import PlaceholderPage from "@/components/common/PlaceholderPage";

export default function RecognitionLab() {
  return (
    <PlaceholderPage
      title="Recognition Lab"
      subtitle="Розпізнання обличчя та геолокація за фото/відео"
      icon={FaceRetouchingNaturalOutlinedIcon}
      plan={[
        "Завантаження фото/відео → пошук збігів через доступні сервіси й системи відеоспостереження",
        "Виклик як окремого інструмента і як дії прямо з фото всередині справи (Person.photo_url)",
        "Результат прикріпляється до сутності одним кліком, як і в SourceModulePanel",
      ]}
    />
  );
}

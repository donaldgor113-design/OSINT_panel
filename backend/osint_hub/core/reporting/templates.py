from dataclasses import dataclass, field


@dataclass
class TemplateField:
    entity_type: str
    field_key: str
    label: str
    required: bool = False


@dataclass
class ReportTemplateDef:
    id: str
    name: str
    description: str
    icon: str
    primary_entity_type: str | None  # entity type the user picks as the report's subject; None = case-level only
    primary_fields: list[TemplateField] = field(default_factory=list)
    related_sections: list[tuple[str, str]] = field(default_factory=list)  # (entity_type, section_label)


TEMPLATES: dict[str, ReportTemplateDef] = {
    "person_dossier": ReportTemplateDef(
        id="person_dossier",
        name="Досьє на особу",
        description="Максимальна інформація про людину: особисті дані, контакти, адреси, майно, зв'язки",
        icon="👤",
        primary_entity_type="person",
        primary_fields=[
            TemplateField("person", "last_name", "Прізвище", required=True),
            TemplateField("person", "first_name", "Ім'я", required=True),
            TemplateField("person", "patronymic", "По батькові"),
            TemplateField("person", "date_of_birth", "Дата народження"),
            TemplateField("person", "passport_number", "Номер паспорта", required=True),
            TemplateField("person", "tax_id", "ІПН"),
            TemplateField("person", "notes", "Примітки"),
        ],
        related_sections=[
            ("contact", "Контакти"),
            ("location", "Адреси / локації"),
            ("asset", "Майно"),
            ("account", "Облікові записи"),
            ("person", "Пов'язані особи"),
            ("legal_entity", "Пов'язані юридичні особи"),
            ("vehicle", "Транспортні засоби"),
        ],
    ),
    "legal_entity_dossier": ReportTemplateDef(
        id="legal_entity_dossier",
        name="Досьє на юридичну особу",
        description="Керівники, бенефіціари, пов'язані компанії, адреси",
        icon="🏢",
        primary_entity_type="legal_entity",
        primary_fields=[
            TemplateField("legal_entity", "legal_name", "Назва", required=True),
            TemplateField("legal_entity", "registration_number", "ЄДРПОУ", required=True),
            TemplateField("legal_entity", "director_name", "Керівник", required=True),
            TemplateField("legal_entity", "registered_address", "Юридична адреса"),
            TemplateField("legal_entity", "statutory_capital", "Статутний капітал"),
            TemplateField("legal_entity", "notes", "Примітки"),
        ],
        related_sections=[
            ("person", "Керівники та бенефіціари"),
            ("legal_entity", "Пов'язані компанії"),
            ("location", "Адреси"),
            ("contact", "Контакти"),
        ],
    ),
    "surveillance_report": ReportTemplateDef(
        id="surveillance_report",
        name="Звіт з відеонагляду",
        description="Маршрут, точки спостереження, транспорт, докази",
        icon="🎥",
        primary_entity_type=None,
        related_sections=[
            ("vehicle", "Транспортні засоби"),
            ("location", "Точки спостереження"),
            ("person", "Особи в справі"),
        ],
    ),
    "recognition_report": ReportTemplateDef(
        id="recognition_report",
        name="Звіт з розпізнання",
        description="Результати розпізнання особи або геолокації за фото/відео",
        icon="🔎",
        primary_entity_type="person",
        primary_fields=[
            TemplateField("person", "first_name", "Ім'я"),
            TemplateField("person", "last_name", "Прізвище"),
            TemplateField("person", "photo_url", "Фото", required=True),
        ],
        related_sections=[
            ("location", "Встановлена геолокація"),
        ],
    ),
}

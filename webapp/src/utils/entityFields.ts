import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessIcon from "@mui/icons-material/Business";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PlaceIcon from "@mui/icons-material/Place";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import type { EntityType } from "@/types/api";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "date";
}

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  person: "Особа",
  legal_entity: "Юридична особа",
  vehicle: "Транспортний засіб",
  location: "Локація",
  account: "Обліковий запис",
  contact: "Контакт",
  asset: "Майно",
};

export const ENTITY_TYPE_ICON: Record<EntityType, ComponentType<SvgIconProps>> = {
  person: PersonOutlineIcon,
  legal_entity: BusinessIcon,
  vehicle: DirectionsCarIcon,
  location: PlaceIcon,
  account: AlternateEmailIcon,
  contact: ContactPhoneIcon,
  asset: Inventory2Icon,
};

export const ENTITY_TYPE_COLOR: Record<EntityType, string> = {
  person: "#8B5CF6",
  legal_entity: "#3B82F6",
  vehicle: "#F59E0B",
  location: "#10B981",
  account: "#EC4899",
  contact: "#06B6D4",
  asset: "#EF4444",
};

export const ENTITY_FIELDS: Record<EntityType, FieldConfig[]> = {
  person: [
    { key: "first_name", label: "Ім'я", type: "text" },
    { key: "last_name", label: "Прізвище", type: "text" },
    { key: "patronymic", label: "По батькові", type: "text" },
    { key: "date_of_birth", label: "Дата народження", type: "date" },
    { key: "passport_number", label: "Номер паспорта", type: "text" },
    { key: "tax_id", label: "ІПН", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  legal_entity: [
    { key: "legal_name", label: "Назва", type: "text" },
    { key: "registration_number", label: "ЄДРПОУ", type: "text" },
    { key: "director_name", label: "Керівник", type: "text" },
    { key: "registered_address", label: "Юридична адреса", type: "text" },
    { key: "statutory_capital", label: "Статутний капітал", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  vehicle: [
    { key: "plate_number", label: "Номерний знак", type: "text" },
    { key: "make", label: "Марка", type: "text" },
    { key: "model", label: "Модель", type: "text" },
    { key: "year", label: "Рік", type: "number" },
    { key: "vin", label: "VIN", type: "text" },
    { key: "color", label: "Колір", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  location: [
    { key: "address", label: "Адреса", type: "text" },
    { key: "latitude", label: "Широта", type: "number" },
    { key: "longitude", label: "Довгота", type: "number" },
    { key: "location_type", label: "Тип (проживання/робота/спостереження)", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  account: [
    { key: "platform", label: "Платформа", type: "text" },
    { key: "handle", label: "Нік / ID", type: "text" },
    { key: "url", label: "URL", type: "text" },
    { key: "followers_count", label: "Підписників", type: "number" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  contact: [
    { key: "contact_type", label: "Тип (phone/email)", type: "text" },
    { key: "value", label: "Значення", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
  asset: [
    { key: "asset_type", label: "Тип майна", type: "text" },
    { key: "description", label: "Опис", type: "text" },
    { key: "estimated_value", label: "Орієнтовна вартість", type: "text" },
    { key: "notes", label: "Примітки", type: "text" },
  ],
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  confirmed: "Підтверджено",
  probable: "Ймовірно",
  unverified: "Неперевірено",
};

export const CONFIDENCE_COLOR: Record<string, string> = {
  confirmed: "#10B981",
  probable: "#F59E0B",
  unverified: "#94A3B8",
};

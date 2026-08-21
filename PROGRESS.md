# OSINT HUB — Прогрес розробки

**Останнє оновлення:** 2026-08-22
**Джерела правди:**
- `D:\download\OSINT_HUB_DEVELOPMENT_STANDARD.md` — базова архітектура/API/БД
- `D:\download\OSINT_HUB_DESIGN_SYSTEM.md` — дизайн-токени
- `D:\download\OSINT_HUB_MODULE_ARCHITECTURE.md` — **головний, найсвіжіший документ**: entity-centric модель (Case/Entity/Relationship), навігація, SourceModulePanel-патерн. Замінює навігацію зі STANDARD-документа.

Жоден з трьох документів не в репозиторії (лежать локально в `D:\download`) — якщо працюєш з іншого ПК, візьми їх звідти або попроси наново.

Проєкт росте частинами ("по частинах") — кожна частина обговорюється й перевіряється перед наступною. Цей файл — знімок стану на момент останнього коміту, не історія чату.

---

## 1. Що вже реально працює

### Backend (`backend/`) — FastAPI + PostgreSQL
- **Стек**: FastAPI, async SQLAlchemy 2.0, Alembic, PostgreSQL, JWT (access+refresh), bcrypt, Fernet-шифрування секретів
- **Таблиці** (3 міграції):
  - `users`, `sessions`, `audit_logs`, `registries`, `queries` — базова інфраструктура
  - **Entity-модель** (за `MODULE_ARCHITECTURE.md`): `cases`, `entities` + типізовані `*_details` (person/legal_entity/vehicle/location/account/contact/asset), `relationships`, `events`, `field_provenance` (походження кожного поля), `entity_media`
- **API, що реально працює**:
  - `POST /api/v1/auth/{login,logout,refresh,change-password}`
  - `GET/POST /api/v1/registries`, `POST /registries/{id}/test`, `POST /registries/{id}/query`
  - `POST/GET /api/v1/queries`, `GET /queries/{id}`, `DELETE /queries/{id}`
  - `POST/GET/PATCH /api/v1/cases`, `GET /cases/{id}`
  - `POST/GET /api/v1/cases/{id}/entities`, `GET/PATCH/DELETE /entities/{id}`
  - `POST /api/v1/relationships`, `GET /cases/{id}/relationships`
  - `POST/GET /api/v1/cases/{id}/events`
  - Перевірено end-to-end вручну: справа → сутність з деталями → зв'язок → відображення
- **Адаптери реєстрів** (`backend/osint_hub/integrations/registries/`) — рівень "API-інтеграція" з `MODULE_ARCHITECTURE.md` розділу 5:
  - `api_adapter.py` — робочий generic REST-адаптер
  - `almaz_adapter.py` — чесна заглушка
  - `implementations/dmu.py`, `edr.py` — симульовані адаптери
  - **Ще не зроблено**: рівні "вбудований webview" (імітація логіну людини) і "бот-інтерфейс" з розділу 5 — це частина SourceModulePanel-пілота (Phase 3, наступна частина)

### Frontend (`webapp/`) — React + Redux + MUI
- **Навігація перебудована під `MODULE_ARCHITECTURE.md`** (не під STANDARD-документ, він застарів):
  Дашборд (`/`) · **Справи** (`/cases`, `/cases/:id`) · Відеонагляд (`/surveillance`) · Recognition Lab (`/recognition`) · Моніторинг (`/monitoring`) · Capture Inbox (`/capture`) · Звіти (`/reports`) · Граф зв'язків (`/graph`) · Налаштування (`/settings`)
- **Реально підключено до бекенду**: логін, **Справи** (список + деталі: реальні сутності, зв'язки, чекліст незаповнених полів — саме той механізм, що автоматично живить майбутній Report Generator), Реєстри (тепер вкладка в Налаштуваннях)
- **Чесні заглушки** (видно в навігації, є опис плану, немає фейкового функціоналу): Відеонагляд, Recognition Lab, Моніторинг, Capture Inbox
- **Ще на mock-даних**: Звіти (шаблони+архів), Граф зв'язків (поки демо-дані, не сутності конкретної справи), Аудит-лог (вкладка в Налаштуваннях)
- **Старі сторінки лишені доступними за URL, але прибрані з навігації** (щоб нічого не зламати, за принципом документа "не переносити інструмент у новий патерн, доки новий не обкатаний"): `/tools` (старий Пошук: cards/json/map/media), `/analysis` (стара Аналітика), `/ai` (AI-асистент), `/audit` (старий Аудит-лог)

---

## 2. Архітектурний принцип (важливо не забути)

> Будь-який знайдений факт — це не текст у нотатці, а поле сутності в справі, з фіксованим джерелом походження.

Це означає: Report Generator НЕ буде окремою фічею, яку треба писати з нуля. Звіт = шаблон (список полів) + дані з `entities`/`*_details` конкретної справи. "Автозаповнення звіту" з'явиться само собою, коли будуть готові (а) реальний збір даних через SourceModulePanel і (б) сам Report Generator, що просто читає ці поля.

### Пілот — ГОТОВО ✓
`SourceModulePanel` (задача 1, пошук людини) реалізовано і перевірено end-to-end: `webapp/src/components/sourcemodule/` (SourceModulePanel.tsx, AttachResultDialog.tsx), сторінка `/cases/:id/search`, кнопка "Пошук через джерела" на сторінці справи.
- Зона параметрів пошуку: прізвище/ім'я/по батькові/телефон/email
- Зона джерел: усі активні реєстри паралельно, статус connected/auth_required/network_unavailable (`webapp/src/utils/connectorStatus.ts`)
- Зона захоплення: прикріпити будь-який результат до нової або існуючої `Person`-сутності поточної справи, з provenance
- Побічно знайдено й виправлено реальний баг: `POST /registries/{id}/query` мовчки повертав порожній масив при помилці адаптера замість самої помилки — тепер `error` явно в відповіді
- **Ще не зроблено**: рівні конекторів "вбудований webview" і "бот" (тільки API-рівень); мапінг полів result→entity зараз наївний (лише точні співпадіння назв полів)

### 6 задач користувача → куди лягають
| # | Задача | Розділ |
|---|---|---|
| 1 | Пошук людини + родичі/майно | Справи (пілот) |
| 2 | Юридичні особи, керівники, держзакупівлі | Справи |
| 3 | Відеонагляд, маршрути, розпізнання авто/особи, докази | Відеонагляд |
| 4 | Розпізнання обличчя / гео за фото-відео | Recognition Lab (+ дія прямо з фото сутності) |
| 5 | Довстановлення відсутніх даних у досьє | **Не окремий розділ** — чекліст незаповнених полів у Справі (вже працює) |
| 6 | Моніторинг соцмереж, ботоферми | Моніторинг |

---

## 3. Як запустити (наступного разу)

### Варіант A — Docker (якщо на новому ПК вже стоїть Docker)
```bash
cp .env.example .env
# заповни DB_PASSWORD, SECRET_KEY (32+ символів) у .env
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m osint_hub.scripts.create_admin
```

### Варіант B — локально без Docker (як зараз)
Бекенд:
```bash
cd backend
cp .env.example .env   # заповни DATABASE_URL під свій локальний Postgres
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt   # якщо .venv нема
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m osint_hub.scripts.create_admin
.venv/Scripts/python -m uvicorn osint_hub.main:app --host 127.0.0.1 --port 8000
```
Фронтенд:
```bash
cd webapp
npm install
npm run dev
```
Відкрити `http://localhost:5173`.

### Наповнити реєстри демо-даними (опційно)
9 реєстрів (Shodan, Maltego, Telegram API, Google Dorks, VirusTotal, X/Twitter, Instagram, Pastebin, DNSTwist) засіяні напряму через тимчасовий Python-скрипт (не в репозиторії). На новій БД — додай вручну через Swagger (`/docs` → `POST /registries`) або попроси відтворити.

---

## 4. Важливі технічні нюанси (щоб не наступати на ті самі граблі)

- **Vite-проксі обов'язковий**: фронтенд ходить на бекенд через відносний шлях `/api/v1`, `vite.config.ts` проксує `/api` → `http://127.0.0.1:8000`. Абсолютний `VITE_API_URL` ламається в середовищах з ізольованим browser-прев'ю.
- **Datetime-колонки в БД — обов'язково `TIMESTAMPTZ`** (`DateTime(timezone=True)`), не `TIMESTAMP WITHOUT TIME ZONE`.
- **getpass на Windows не читає з pipe/redirected stdin** — `create_admin.py` тільки в реальному інтерактивному терміналі.
- Git-ідентичність для цього репо виставлена локально (`git config --local`), не глобально.
- Кожна `*_details` таблиця — 1:1 з `entities.id` (entity_id — і PK, і FK одночасно). Додавання нового поля сутності = ALTER TABLE відповідної `*_details`, не чіпає `entities`.

---

## 5. Відкриті рішення / що обговорити далі

1. **Вбудовані браузери** (для рівня "webview з імітацією логіну" з `MODULE_ARCHITECTURE.md` розділу 5): Electron+BrowserView або server-side Playwright+стрімінг. Відкладено, обговоримо коли дійдемо до SourceModulePanel.
2. **SourceModulePanel** (документ, розділ 4 і 9.3) — генерик-компонент "параметри пошуку / вкладки джерел / захоплення в сутність", пілот на пошуку людини. Наступна велика частина.
3. **Capture Inbox фаза 1** (ручне тегування без AI) — іде одразу після пілота SourceModulePanel, за планом документа.
4. **Report Generator** — шаблон + мапінг полів з entity-моделі, підсвітка порожніх обов'язкових полів (частково вже є як "чекліст" у Справі, треба довести до генерації самого документа).
5. Старі `/tools`, `/analysis`, `/ai`, `/audit` сторінки — коли SourceModulePanel і Report Generator стабілізуються, ці файли можна прибрати остаточно.

---

## 6. Тестові облікові дані (dev, не production)
- Username: `admin`
- Password: `AdminPass123`
*(створено локальним `create_admin.py`; на новій БД/новому ПК потрібно створити наново)*

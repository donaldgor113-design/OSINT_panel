# OSINT HUB — Прогрес розробки

**Останнє оновлення:** 2026-08-19
**Джерела правди:** `D:\download\OSINT_HUB_DEVELOPMENT_STANDARD.md` (архітектура/API/БД), `D:\download\OSINT_HUB_DESIGN_SYSTEM.md` (дизайн). Обидва документи не в репозиторії (лежать локально в `D:\download`) — якщо працюєш з іншого ПК, візьми їх звідти або попроси наново.

Проєкт росте частинами ("по частинах") — кожна частина обговорюється й перевіряється перед наступною. Цей файл — знімок стану на момент останнього коміту, не історія чату.

---

## 1. Що вже реально працює

### Backend (`backend/`) — FastAPI + PostgreSQL
- **Стек**: FastAPI, async SQLAlchemy 2.0, Alembic, PostgreSQL, JWT (access+refresh), bcrypt, Fernet-шифрування секретів
- **Таблиці** (2 міграції): `users`, `sessions`, `audit_logs`, `registries`, `queries` — точно за схемою з документа
- **API, що реально працює**:
  - `POST /api/v1/auth/{login,logout,refresh,change-password}` — повний JWT-флоу, кожен login/logout пишеться в `audit_logs`
  - `GET/POST /api/v1/registries`, `POST /registries/{id}/test`, `POST /registries/{id}/query`
  - `POST/GET /api/v1/queries`, `GET /queries/{id}`, `DELETE /queries/{id}`
- **Адаптери реєстрів** (`backend/osint_hub/integrations/registries/`):
  - `api_adapter.py` — робочий generic REST-адаптер (реальні HTTP-запити через httpx, якщо в реєстра задано endpoint)
  - `almaz_adapter.py` — чесна заглушка (немає апаратного токена)
  - `implementations/dmu.py`, `edr.py` — симульовані адаптери з explicit-позначеними fake-даними
  - `implementations/custom.py` — шаблон для нових реєстрів
- **Немає ще**: entities/relationships/investigations/reports/ai_agent_tasks endpoints (таблиці з документа, яких ми ще не чіпали)

### Frontend (`webapp/`) — React + Redux + MUI
- Перебудований з "одна робоча область" на **routed multi-page app** з 8 розділами (NavRail зліва, `react-router-dom`):
  - Дашборд (`/`), Інструменти (`/tools` — Пошук/Реєстри/Браузери/API), Аналітика (`/analysis` — Knowledge Graph на `cytoscape.js` + Timeline), Мапа (`/map`), Звіти (`/reports`), AI-асистент (`/ai`), Налаштування (`/settings`), Аудит-лог (`/audit`)
- **Дизайн-система**: slate-палітра + violet-акцент за `OSINT_HUB_DESIGN_SYSTEM.md`, MUI-іконки замість емодзі, типографіка/spacing за документом
- **Реально підключено до бекенду**: логін (`/login`, JWT, auto-refresh), список реєстрів (Інструменти → Реєстри), test-connection, виконання запиту через реєстр
- **Ще на mock-даних**: Пошук (старі cards/json/map/media), Аналітика, Звіти, AI-асистент, Аудит-лог, Дашборд KPI (крім тих, що беруться з `workspace` store)

---

## 2. Як запустити (наступного разу)

### Варіант A — Docker (якщо на новому ПК вже стоїть Docker)
```bash
cp .env.example .env
# заповни DB_PASSWORD, SECRET_KEY (32+ символів) у .env
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m osint_hub.scripts.create_admin
```
Бекенд буде на `http://localhost:8000`. **Увага**: сьогоднішній фронтенд-проксі (`webapp/vite.config.ts`) вказує на `http://127.0.0.1:8000` — з Docker це має співпасти, якщо порт бекенд-контейнера прокинутий на 8000 (він прокинутий, дивись `docker-compose.yml`).

### Варіант B — локально без Docker (як сьогодні)
Бекенд:
```bash
cd backend
cp .env.example .env   # заповни DATABASE_URL під свій локальний Postgres
.venv якщо нема: python -m venv .venv && .venv/Scripts/pip install -r requirements.txt
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
Відкрити `http://localhost:5173`, увійти адміном, якого щойно створив.

### Наповнити реєстри демо-даними (опційно)
На сьогоднішньому запуску 9 реєстрів (Shodan, Maltego, Telegram API, Google Dorks, VirusTotal, X/Twitter, Instagram, Pastebin, DNSTwist) були засіяні напряму через Python-скрипт у БД (не в репозиторії — робилось вручну через тимчасовий scratch-скрипт). Якщо база нова/порожня, після `create_admin` можна додати реєстри вручну через Swagger (`/docs` → `POST /registries`) або попросити відтворити той самий seed.

---

## 3. Важливі технічні нюанси (щоб не наступати на ті самі граблі)

- **Vite-проксі обов'язковий**: фронтенд ходить на бекенд через відносний шлях `/api/v1` (див. `webapp/.env.development`), а `vite.config.ts` проксує `/api` → `http://127.0.0.1:8000`. Якщо просто вкажеш абсолютний `http://localhost:8000` в `VITE_API_URL` — у деяких середовищах (де браузер-прев'ю ізольований від довільних localhost-портів) запити не пройдуть. Тримай проксі-підхід.
- **Datetime-колонки в БД — обов'язково `TIMESTAMPTZ`** (`DateTime(timezone=True)` в SQLAlchemy), не `TIMESTAMP WITHOUT TIME ZONE` — інакше падає на `asyncpg.exceptions.DataError` при записі timezone-aware `datetime.now(timezone.utc)`.
- **getpass на Windows не читає з pipe/redirected stdin** — `create_admin.py` треба запускати в реальному інтерактивному терміналі, не через автоматизований non-interactive виклик.
- Git-ідентичність для цього репо виставлена локально (`git config --local user.name/user.email`), не глобально.

---

## 4. Відкриті рішення / що обговорити далі

1. **Вбудовані браузери** (вкладка "Браузери" в Інструментах): зараз це просто моніторинг-панель на mock-даних. Щоб зробити справжні перемикні браузер-сесії всередині сервісу (як просив користувач), потрібен один з двох шляхів:
   - **Electron + BrowserView/webview** — відповідає оригінальному документу ("Desktop Wrapper: Electron"), великий обсяг роботи (новий desktop-шар).
   - **Server-side Playwright/Selenium + стрімінг у браузер** (VNC/WebSocket) — залишається чистим веб-додатком, складніша інфраструктура.
   - Вирішено: **відкладено**, спершу довести до пуття те, що вже є.
2. **Наступні бекенд-частини** (за документом, не зроблені): entities/relationships (knowledge graph — зараз тільки mock), investigations, reports generation, ai_agent_tasks + реальна інтеграція Claude API.
3. **"Пошук" (старий workspace)** — CardsView/JsonView/MapView/MediaView з drag&drop все ще на mock-даних, ризикована глибока переробка, свідомо відкладена окремо від "Реєстрів".

---

## 5. Тестові облікові дані (dev, не production)
- Username: `admin`
- Password: `AdminPass123`
*(створено локальним `create_admin.py`; на новій БД/новому ПК потрібно створити наново)*

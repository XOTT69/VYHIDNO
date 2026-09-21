# VYHIDNO

Український shopping assistant: актуальні пропозиції, перевірка реальності знижки, історія ціни, DealMap, watchlist і reverse marketplace «Назви свою ціну».

Production:

- Web: https://vyhidno-web.pages.dev
- API: https://vyhidno-api.ai-beta69690.workers.dev

## Що працює

- Пошук за назвою, брендом, моделлю, GTIN/EAN і MPN.
- Каталог реальних падінь ціни з категоріями та VYHIDNO Score.
- Сторінка товару: найкраща пропозиція, доставка, історія, 30-денне середнє і 180-денний мінімум.
- DealMap з геолокацією, радіусом і відстанню до магазину.
- Watchlist на рівні анонімного device ID: додавання, зміна цільової ціни, список і видалення.
- «Назви свою ціну»: створення запиту та отримання пропозицій продавців.
- Захищений ingest endpoint з matching у порядку GTIN → brand+MPN → brand+model → створення canonical product.
- Автоматичний перерахунок score після ingest і Cloudflare Cron кожні 6 годин.
- PWA shell без кешування API-відповідей.

## Стек

- `apps/web` — React, TypeScript, Vite, React Router, Leaflet.
- `apps/api` — Cloudflare Worker, TypeScript, D1.
- `.github/workflows` — CI та окремі deploy workflows для Worker і Pages.

## Локальний запуск

Потрібен Node.js 22+.

```bash
npm install
cp apps/api/.dev.vars.example apps/api/.dev.vars
npm run db:local
```

Запустіть API:

```bash
npm run dev:api
```

В іншому терміналі запустіть web:

```bash
npm run dev:web
```

- Web: `http://localhost:5173`
- API: `http://localhost:8787`
- Vite проксіює `/api` на локальний Worker.

Перевірка перед комітом:

```bash
npm run verify
```

## Ingest першого магазину

`POST /api/ingest/offer` із заголовком `x-ingest-secret`. Приклад:

```json
{
  "store": { "name": "My Store", "domain": "store.example", "reliabilityScore": 90 },
  "product": {
    "name": "Apple AirPods Pro USB-C",
    "brand": "Apple",
    "model": "AirPods Pro",
    "gtin": "0195949052651",
    "category": "Техніка"
  },
  "externalSku": "sku-123",
  "externalUrl": "https://store.example/product/sku-123",
  "price": 6999,
  "oldPrice": 8499,
  "deliveryPrice": 0,
  "availability": "in_stock",
  "location": {
    "name": "Магазин на Хрещатику",
    "address": "Київ, вул. Хрещатик, 1",
    "city": "Київ",
    "lat": 50.4501,
    "lng": 30.5234
  }
}
```

## Production deployment

1. Створіть D1:

   ```bash
   cd apps/api
   npx wrangler d1 create vyhidno-db
   ```

2. Вставте отриманий `database_id` у `apps/api/wrangler.toml`.
3. Застосуйте схему й seed:

   ```bash
   npm run db:remote
   ```

4. Додайте secret:

   ```bash
   npx wrangler secret put INGEST_SECRET
   ```

5. Додайте custom web domain до `APP_ORIGIN` у `wrangler.toml`, якщо використовуєте не лише `vyhidno-web.pages.dev`.
6. Production API URL збережений у `apps/web/.env.production`; за потреби його можна перевизначити repository variable `VITE_API_BASE`.
7. Для GitHub Actions потрібні repository secrets `CLOUDFLARE_API_TOKEN` та `CLOUDFLARE_ACCOUNT_ID`.

`wrangler.toml` уже містить ID production D1 `vyhidno-db`. Для повторного CI/CD deploy потрібно додати до GitHub Actions secrets `CLOUDFLARE_API_TOKEN` і `CLOUDFLARE_ACCOUNT_ID`; локальна версія також повністю запускається на D1 local.

## API

- `GET /api/health`
- `GET /api/products?q=&category=`
- `GET /api/products/:slugOrId`
- `GET /api/deals?category=&minScore=&limit=`
- `GET /api/map/deals?lat=&lng=&radius=`
- `GET|POST /api/watchlist`
- `DELETE /api/watchlist/:productId`
- `GET|POST /api/requests`
- `GET /api/requests/:id/offers`
- `POST /api/ingest/offer` (secret)
- `POST /api/admin/recalculate` (secret)

Доступні джерела даних, офіційні способи отримання feed-ів і запуск універсального XML/YML/CSV імпортера описані в [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md).

## Межі MVP

Автоматичні Telegram/Web Push повідомлення та кабінет продавця потребують окремих провайдерів і автентифікації. Дані й API для watchlist та seller offers уже готові, але жоден канал сповіщень не імітується у UI.

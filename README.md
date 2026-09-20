# VYHIDNO 0.1

Український shopping assistant: пошук найкращої ціни, реальні падіння цін, DealMap, watchlist та reverse marketplace “Назви свою ціну”.

## Стек
- React + TypeScript + Vite (PWA-ready frontend)
- Cloudflare Workers (API)
- Cloudflare D1 (SQL)
- Cloudflare Cron / Queues — наступний етап для збору цін
- GitHub Actions — CI/deploy

## Локальний запуск
```bash
npm install
npm run dev:web
```
У другому терміналі:
```bash
npm run dev:api
```

Frontend: http://localhost:5173
API: http://localhost:8787

## D1
1. Створи D1 базу в Cloudflare.
2. Впиши її `database_id` у `apps/api/wrangler.toml`.
3. Виконай міграцію:
```bash
cd apps/api
npx wrangler d1 execute vyhidno-db --local --file=./migrations/0001_init.sql
```

## Deploy
### API
```bash
npm run deploy:api
```

### Web
Створи Cloudflare Pages project `vyhidno-web`, після чого:
```bash
npm run build
npm run deploy:web
```

## GitHub Actions secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## V0.1
- Головна + smart search
- “Подешевшало сьогодні”
- картка товару з історією ціни
- VYHIDNO Score
- watchlist
- DealMap UI
- “Назви свою ціну”
- API + D1 schema

## Далі
1. Реальні data connectors / feeds магазинів.
2. Matching одного товару між різними магазинами.
3. Cron-збір цін та price_history.
4. Auth.
5. Telegram / Web Push.
6. Геоприв'язка офлайн-магазинів для DealMap.

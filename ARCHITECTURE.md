# VYHIDNO architecture

## Product principle
Одна обіцянка: **допомогти купити вигідніше**.

### Consumer surfaces
- Search / URL import
- Product page + VYHIDNO Score
- Deals feed
- Watchlist + alerts
- DealMap
- Shopping basket optimizer (v0.3)
- “Назви свою ціну” reverse marketplace

### Data layer
1. Feed/API/parser connectors створюють `offers`.
2. Кожна зміна ціни пишеться в `price_history`.
3. Matching engine прив'язує магазинні SKU до canonical `products`.
4. Scoring job рахує deal score та “real discount”.
5. Alerts job перевіряє watchlist.

## VYHIDNO Score (first formula)
0–100, без рекламних коефіцієнтів.
- 35%: position vs 30-day average
- 30%: position vs 180-day minimum
- 20%: price vs current competing offers
- 10%: delivery-adjusted total
- 5%: availability / merchant reliability signal

Sponsored placement ніколи не змінює score.

## Matching
Пріоритет:
1. GTIN/EAN exact
2. manufacturer SKU / MPN exact
3. normalized brand + model + variant
4. fuzzy title match only as candidate, not automatic truth

## Security basics
- API secrets only in Cloudflare/GitHub secrets
- rate limiting before public launch
- seller actions require auth
- price ingest endpoints must be signed/private
- sanitize seller/user text
- do not expose raw connector credentials to browser

# Джерела товарів і цін

## Рекомендований порядок підключення

1. **Admitad product feeds** — найкращий перший production-канал. В офіційному каталозі є Foxtrot UA, VARUS.UA, ATB UA, Telemart UA, MasterZoo UA та інші рекламодавці з product feed. Потрібно зареєструвати VYHIDNO як publisher, пройти модерацію потрібних програм і отримати URL фідів.
2. **Прямі XML/YML/CSV фіди магазинів** — запросити партнерський feed із ціною, old price, наявністю, URL, GTIN/MPN і координатами/точками видачі.
3. **Seller API** — підходить, якщо власник конкретного магазину надає доступ до свого кабінету. Це не загальний buyer-side каталог:
   - Prom.ua Public API: токен видає співробітник порталу; API повертає власні товари компанії.
   - ROZETKA Marketplace API/Pricecreator: потрібен seller account; XML Pricecreator захищений від стороннього використання.
   - Epicentr Marketplace API: токен генерується в seller cabinet; потрібна реєстрація продавця й договір.
4. **Hotline-compatible feeds** — корисний стандарт для прямої домовленості з магазинами. Hotline приймає XML, YML, CSV/XLS/TXT і описує поля ціни, наявності, доставки та координат. Сам Hotline не заявляє відкритий API для масового вивантаження своїх цін.
5. **Open Food Facts** — безкоштовне доповнення для назви/бренду/зображення за штрихкодом, але не джерело актуальних цін українських магазинів.

## Офіційні посилання

- Admitad product feeds: https://www.admitad.com/store/product-feed/
- Як працюють product feeds Admitad: https://admitad.useresponse.com/knowledge-base/article/product-feed-what-it-is-and-how-to-upload-it-to-affiliate-program_3
- Prom.ua Public API: https://public-api.docs.prom.ua/
- ROZETKA seller help: https://sellerhelp.rozetka.com.ua/
- ROZETKA Pricecreator XML: https://sellerhelp.rozetka.com.ua/p385-moving-products-xml-pricecreator.html
- Epicentr Marketplace seller center: https://supportm.epicentrk.ua/
- Epicentr seller registration: https://epicentrk.ua/ua/seller/
- Hotline feed specification: https://hotline.ua/ua/about/pricelists_specs/
- Open Food Facts barcode API: https://openfoodfacts.github.io/documentation/docs/Product-Opener/v3/products/get-api-v3-product-code/
- Google product feed specification: https://support.google.com/merchants/answer/7052112

## Запуск універсального імпортера

Імпортер підтримує типові YML, Hotline XML і CSV з поширеними назвами колонок.

```bash
FEED_URL='https://partner.example/feed.xml' \
INGEST_URL='https://vyhidno-api.<account>.workers.dev' \
INGEST_SECRET='...' \
STORE_NAME='Example Store' \
STORE_DOMAIN='example.ua' \
npm --workspace @vyhidno/api run import:feed
```

Додаткові параметри: `FEED_FORMAT=xml|csv`, `FEED_LIMIT`, `FEED_CONCURRENCY`.

Не використовуйте feed без дозволу його власника. Для сайтів без API/feed спочатку отримайте письмовий дозвіл або партнерські умови; HTML scraping не є базовим production-каналом VYHIDNO.

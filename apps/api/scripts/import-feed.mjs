import { XMLParser } from 'fast-xml-parser'

const required = ['FEED_URL', 'INGEST_URL', 'INGEST_SECRET', 'STORE_NAME']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

const feedUrl = process.env.FEED_URL
const ingestUrl = process.env.INGEST_URL.replace(/\/$/, '')
const ingestSecret = process.env.INGEST_SECRET
const storeName = process.env.STORE_NAME
const storeDomain = process.env.STORE_DOMAIN || new URL(feedUrl).hostname
const limit = Math.max(1, Number(process.env.FEED_LIMIT || 100000))
const concurrency = Math.min(20, Math.max(1, Number(process.env.FEED_CONCURRENCY || 5)))

const response = await fetch(feedUrl, { headers: { 'user-agent': 'VYHIDNO/1.0 feed importer' } })
if (!response.ok) throw new Error(`Feed download failed: HTTP ${response.status}`)
const source = await response.text()
const contentType = response.headers.get('content-type') || ''
const format = process.env.FEED_FORMAT || (contentType.includes('csv') || /\.csv(?:\?|$)/i.test(feedUrl) ? 'csv' : 'xml')
const rawItems = format === 'csv' ? parseCsv(source) : parseXml(source)
const items = rawItems.map(normalizeOffer).filter(Boolean).slice(0, limit)

if (!items.length) throw new Error('Feed parsed successfully, but no valid offers were found.')
console.log(`Parsed ${items.length} offers from ${feedUrl}`)

let imported = 0
const errors = []
for (let offset = 0; offset < items.length; offset += concurrency) {
  const batch = items.slice(offset, offset + concurrency)
  await Promise.all(batch.map(async item => {
    try {
      const result = await fetch(`${ingestUrl}/api/ingest/offer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-ingest-secret': ingestSecret },
        body: JSON.stringify(item)
      })
      if (!result.ok) throw new Error(`HTTP ${result.status}: ${await result.text()}`)
      imported += 1
    } catch (error) {
      errors.push({ sku: item.externalSku, error: error instanceof Error ? error.message : String(error) })
    }
  }))
  if ((offset + batch.length) % 100 === 0 || offset + batch.length === items.length) console.log(`Processed ${offset + batch.length}/${items.length}`)
}

console.log(JSON.stringify({ imported, failed: errors.length, errors: errors.slice(0, 20) }, null, 2))
if (errors.length) process.exitCode = 1

function parseXml(text) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', trimValues: true, parseTagValue: false })
  const document = parser.parse(text)
  const candidates = [
    document?.yml_catalog?.shop?.offers?.offer,
    document?.shop?.offers?.offer,
    document?.price?.items?.item,
    document?.items?.item,
    document?.products?.product,
    document?.catalog?.items?.item
  ]
  const found = candidates.find(Boolean)
  if (!found) throw new Error('Unsupported XML structure. Expected YML offers or Hotline-style items.')
  return Array.isArray(found) ? found : [found]
}

function parseCsv(text) {
  const rows = []
  let row = [], value = '', quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (!quoted && (char === ',' || char === ';' || char === '\t')) { row.push(value); value = '' }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(value); value = ''
      if (row.some(cell => cell.trim())) rows.push(row)
      row = []
    } else value += char
  }
  if (value || row.length) { row.push(value); rows.push(row) }
  if (rows.length < 2) return []
  const headers = rows[0].map(header => header.trim().toLowerCase())
  return rows.slice(1).map(cells => Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() || ''])))
}

function normalizeOffer(item) {
  const externalSku = pick(item, ['@_id','id','sku','external_id','offer_id','код'])
  const name = pick(item, ['name','title','model','назва','товар'])
  const url = pick(item, ['url','link','external_url','посилання'])
  const price = numeric(pick(item, ['price','priceuah','ціна']))
  if (!externalSku || !name || !url || !price) return null
  const available = pick(item, ['@_available','available','availability','наявність'])
  return {
    store: { name: storeName, domain: storeDomain },
    product: {
      name,
      brand: pick(item, ['vendor','brand','manufacturer','виробник']),
      model: pick(item, ['model','модель']),
      variant: pick(item, ['variant','параметри']),
      category: pick(item, ['category','category_name','категорія']),
      gtin: pick(item, ['barcode','gtin','ean','штрихкод']),
      mpn: pick(item, ['vendorCode','vendor_code','mpn','manufacturer_sku','артикул']),
      imageUrl: pick(item, ['picture','image','image_url','фото']),
      description: pick(item, ['description','опис'])
    },
    externalSku,
    externalUrl: url,
    titleRaw: name,
    price,
    oldPrice: numeric(pick(item, ['oldprice','old_price','price_old','стара_ціна'])),
    deliveryPrice: numeric(pick(item, ['delivery_price','deliverycost','вартість_доставки'])) || 0,
    availability: /false|no|out|немає|0/i.test(String(available)) ? 'out_of_stock' : 'in_stock'
  }
}

function pick(object, keys) {
  for (const key of keys) {
    const value = object?.[key]
    if (value != null && String(value).trim()) return typeof value === 'object' ? value['#text'] || value.value || '' : String(value).trim()
  }
  return ''
}

function numeric(value) {
  if (!value) return undefined
  const number = Number(String(value).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(number) && number > 0 ? number : undefined
}

export interface Env {
  DB: D1Database
  APP_ORIGIN?: string
  INGEST_SECRET?: string
}

type Json = Record<string, unknown> | unknown[]
type Availability = 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown'

type IngestBody = {
  store?: { name?: string; slug?: string; domain?: string; reliabilityScore?: number }
  product?: { name?: string; brand?: string; model?: string; variant?: string; category?: string; gtin?: string; mpn?: string; imageUrl?: string; description?: string }
  location?: { id?: string; name?: string; address?: string; city?: string; lat?: number; lng?: number }
  externalSku?: string
  externalUrl?: string
  titleRaw?: string
  price?: number
  oldPrice?: number
  deliveryPrice?: number
  availability?: Availability
}

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`
const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const clean = (value: unknown, max = 300) => String(value ?? '').trim().slice(0, max)
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9а-яіїєґ]+/gi, '-').replace(/^-|-$/g, '').slice(0, 100) || newId('item')
const normalize = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9а-яіїєґ]+/gi, '')

function responseHeaders(request: Request, env: Env) {
  const origin = request.headers.get('origin') || ''
  const allowed = (env.APP_ORIGIN || '*').split(',').map(value => value.trim())
  const allowOrigin = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0]
  return {
    'access-control-allow-origin': allowOrigin || '*',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,x-ingest-secret',
    'access-control-max-age': '86400',
    'content-security-policy': "default-src 'none'",
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer'
  }
}

function json(request: Request, env: Env, data: Json, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...responseHeaders(request, env) }
  })
}

function error(request: Request, env: Env, code: string, status: number, message: string) {
  return json(request, env, { error: code, message }, status)
}

async function readJson<T>(request: Request): Promise<T | null> {
  try { return await request.json<T>() } catch { return null }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(request, env) })

    try {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        await env.DB.prepare('SELECT 1').first()
        return json(request, env, { ok: true, service: 'vyhidno-api', version: '1.0.0' })
      }
      if (url.pathname === '/api/products' && request.method === 'GET') return listProducts(request, env, url)
      if (url.pathname.startsWith('/api/products/') && request.method === 'GET') return getProduct(request, env, decodeURIComponent(url.pathname.slice(14)))
      if (url.pathname === '/api/deals' && request.method === 'GET') return listDeals(request, env, url)
      if (url.pathname === '/api/map/deals' && request.method === 'GET') return listMapDeals(request, env, url)
      if (url.pathname === '/api/watchlist' && request.method === 'GET') return listWatchlist(request, env, url)
      if (url.pathname === '/api/watchlist' && request.method === 'POST') return saveWatch(request, env)
      if (url.pathname.startsWith('/api/watchlist/') && request.method === 'DELETE') return deleteWatch(request, env, url, decodeURIComponent(url.pathname.slice(15)))
      if (url.pathname === '/api/requests' && request.method === 'GET') return listRequests(request, env, url)
      if (url.pathname === '/api/requests' && request.method === 'POST') return createRequest(request, env)
      if (/^\/api\/requests\/[^/]+\/offers$/.test(url.pathname) && request.method === 'GET') return listSellerOffers(request, env, url.pathname.split('/')[3])
      if (url.pathname === '/api/ingest/offer' && request.method === 'POST') return ingestOffer(request, env)
      if (url.pathname === '/api/admin/recalculate' && request.method === 'POST') {
        if (!validSecret(request, env)) return error(request, env, 'unauthorized', 401, 'Невірний ingest secret.')
        const count = await recalculateAll(env)
        return json(request, env, { ok: true, updated: count })
      }
      return error(request, env, 'not_found', 404, 'Маршрут не знайдено.')
    } catch (cause) {
      console.error(cause)
      return error(request, env, 'internal_error', 500, 'Не вдалося виконати запит.')
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(recalculateAll(env))
  }
}

async function listProducts(request: Request, env: Env, url: URL) {
  const query = clean(url.searchParams.get('q'), 120)
  if (query && query.length < 2) return json(request, env, { items: [] })
  const category = clean(url.searchParams.get('category'), 60)
  const pattern = `%${query.replaceAll('%', '').replaceAll('_', '')}%`
  const result = await env.DB.prepare(`
    SELECT p.id,p.slug,p.name,p.brand,p.model,p.variant,p.category,p.image_url,
      o.price,o.old_price,o.delivery_price,o.external_url,s.name store_name,
      COALESCE(ds.score,50) score,COALESCE(ds.real_discount_pct,0) real_discount_pct
    FROM products p
    LEFT JOIN offers o ON o.id=(SELECT o2.id FROM offers o2 WHERE o2.product_id=p.id AND o2.availability IN ('in_stock','preorder') ORDER BY o2.price+o2.delivery_price ASC LIMIT 1)
    LEFT JOIN stores s ON s.id=o.store_id
    LEFT JOIN deal_scores ds ON ds.offer_id=o.id
    WHERE (?1='' OR p.name LIKE ?2 OR p.brand LIKE ?2 OR p.model LIKE ?2 OR p.gtin=?1 OR p.mpn=?1)
      AND (?3='' OR p.category=?3)
    ORDER BY CASE WHEN o.price IS NULL THEN 1 ELSE 0 END, ds.score DESC, p.updated_at DESC LIMIT 40
  `).bind(query, pattern, category).all()
  return json(request, env, { items: result.results || [] })
}

async function getProduct(request: Request, env: Env, slugOrId: string) {
  const product = await env.DB.prepare('SELECT * FROM products WHERE slug=?1 OR id=?1 LIMIT 1').bind(slugOrId).first<Record<string, unknown>>()
  if (!product) return error(request, env, 'product_not_found', 404, 'Товар не знайдено.')
  const offers = await env.DB.prepare(`
    SELECT o.id,o.price,o.old_price,o.delivery_price,o.currency,o.availability,o.external_url,o.checked_at,o.sponsored,
      s.name store_name,s.reliability_score,ds.score,ds.avg_30,ds.min_180,ds.real_discount_pct
    FROM offers o JOIN stores s ON s.id=o.store_id LEFT JOIN deal_scores ds ON ds.offer_id=o.id
    WHERE o.product_id=?1 ORDER BY CASE WHEN o.availability='in_stock' THEN 0 ELSE 1 END,o.price+o.delivery_price ASC
  `).bind(product.id).all<Record<string, unknown>>()
  const bestOffer = offers.results?.find(item => item.availability === 'in_stock') || offers.results?.[0]
  const history = bestOffer ? await env.DB.prepare('SELECT price,captured_at FROM price_history WHERE offer_id=?1 ORDER BY captured_at ASC LIMIT 365').bind(bestOffer.id).all() : { results: [] }
  return json(request, env, { product, offers: offers.results || [], history: history.results || [] })
}

async function listDeals(request: Request, env: Env, url: URL) {
  const category = clean(url.searchParams.get('category'), 60)
  const minScore = clamp(asNumber(url.searchParams.get('minScore')) ?? 65, 0, 100)
  const limit = clamp(asNumber(url.searchParams.get('limit')) ?? 50, 1, 100)
  const result = await env.DB.prepare(`
    SELECT p.id,p.slug,p.name,p.brand,p.model,p.variant,p.category,p.image_url,
      o.id offer_id,o.price,o.old_price,o.delivery_price,o.external_url,
      s.name store_name,ds.score,ds.avg_30,ds.min_180,ds.real_discount_pct,
      sl.lat,sl.lng,sl.address
    FROM offers o JOIN products p ON p.id=o.product_id JOIN stores s ON s.id=o.store_id
    JOIN deal_scores ds ON ds.offer_id=o.id LEFT JOIN store_locations sl ON sl.id=o.store_location_id
    WHERE o.availability='in_stock' AND ds.score>=?1 AND (?2='' OR p.category=?2)
    ORDER BY ds.score DESC,ds.real_discount_pct DESC LIMIT ?3
  `).bind(minScore, category, limit).all()
  return json(request, env, { items: result.results || [] })
}

async function listMapDeals(request: Request, env: Env, url: URL) {
  const lat = asNumber(url.searchParams.get('lat'))
  const lng = asNumber(url.searchParams.get('lng'))
  const radius = clamp(asNumber(url.searchParams.get('radius')) ?? 25, 1, 200)
  const result = await env.DB.prepare(`
    SELECT p.id,p.slug,p.name,p.variant,p.category,p.image_url,o.price,o.old_price,o.delivery_price,
      s.name store_name,sl.name location_name,sl.address,sl.lat,sl.lng,ds.score,ds.real_discount_pct
    FROM offers o JOIN products p ON p.id=o.product_id JOIN stores s ON s.id=o.store_id
    JOIN store_locations sl ON sl.id=o.store_location_id LEFT JOIN deal_scores ds ON ds.offer_id=o.id
    WHERE o.availability='in_stock' AND sl.lat IS NOT NULL AND sl.lng IS NOT NULL
    ORDER BY ds.score DESC LIMIT 200
  `).all<Record<string, unknown>>()
  const items = (result.results || []).map(item => ({
    ...item,
    distance_km: lat != null && lng != null ? distanceKm(lat, lng, Number(item.lat), Number(item.lng)) : null
  })).filter(item => item.distance_km == null || item.distance_km <= radius).sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999)).slice(0, 100)
  return json(request, env, { items })
}

async function listWatchlist(request: Request, env: Env, url: URL) {
  const deviceId = clean(url.searchParams.get('deviceId'), 100)
  if (!deviceId) return error(request, env, 'device_required', 400, 'Потрібен deviceId.')
  const result = await env.DB.prepare(`
    SELECT w.id watch_id,w.target_price,w.created_at,p.id,p.slug,p.name,p.brand,p.variant,p.category,
      o.price,o.old_price,s.name store_name,COALESCE(ds.score,50) score
    FROM watchlists w JOIN products p ON p.id=w.product_id
    LEFT JOIN offers o ON o.id=(SELECT o2.id FROM offers o2 WHERE o2.product_id=p.id AND o2.availability='in_stock' ORDER BY o2.price+o2.delivery_price LIMIT 1)
    LEFT JOIN stores s ON s.id=o.store_id LEFT JOIN deal_scores ds ON ds.offer_id=o.id
    WHERE w.device_id=?1 ORDER BY w.created_at DESC
  `).bind(deviceId).all()
  return json(request, env, { items: result.results || [] })
}

async function saveWatch(request: Request, env: Env) {
  const body = await readJson<{ deviceId?: string; productId?: string; targetPrice?: number }>(request)
  const deviceId = clean(body?.deviceId, 100), productId = clean(body?.productId, 100)
  const targetPrice = asNumber(body?.targetPrice)
  if (!deviceId || !productId || (targetPrice != null && targetPrice <= 0)) return error(request, env, 'invalid_watch', 400, 'Перевірте товар, пристрій і цільову ціну.')
  const product = await env.DB.prepare('SELECT id FROM products WHERE id=?1').bind(productId).first()
  if (!product) return error(request, env, 'product_not_found', 404, 'Товар не знайдено.')
  const existing = await env.DB.prepare('SELECT id FROM watchlists WHERE device_id=?1 AND product_id=?2').bind(deviceId, productId).first<{ id: string }>()
  if (existing) await env.DB.prepare('UPDATE watchlists SET target_price=?1 WHERE id=?2').bind(targetPrice ?? null, existing.id).run()
  else await env.DB.prepare('INSERT INTO watchlists(id,device_id,product_id,target_price) VALUES(?1,?2,?3,?4)').bind(newId('watch'), deviceId, productId, targetPrice ?? null).run()
  return json(request, env, { ok: true }, existing ? 200 : 201)
}

async function deleteWatch(request: Request, env: Env, url: URL, productId: string) {
  const deviceId = clean(url.searchParams.get('deviceId'), 100)
  if (!deviceId) return error(request, env, 'device_required', 400, 'Потрібен deviceId.')
  await env.DB.prepare('DELETE FROM watchlists WHERE device_id=?1 AND product_id=?2').bind(deviceId, productId).run()
  return json(request, env, { ok: true })
}

async function createRequest(request: Request, env: Env) {
  const body = await readJson<{ productText?: string; productId?: string; budget?: number; deadline?: string; comment?: string; deviceId?: string }>(request)
  const productText = clean(body?.productText, 300), deviceId = clean(body?.deviceId, 100), budget = asNumber(body?.budget)
  if (productText.length < 3 || !budget || budget <= 0 || !deviceId) return error(request, env, 'invalid_request', 400, 'Вкажіть товар, бюджет і deviceId.')
  const requestId = newId('req')
  await env.DB.prepare('INSERT INTO purchase_requests(id,device_id,product_text,product_id,budget,deadline,comment) VALUES(?1,?2,?3,?4,?5,?6,?7)')
    .bind(requestId, deviceId, productText, clean(body?.productId, 100) || null, budget, clean(body?.deadline, 40) || null, clean(body?.comment, 1000) || null).run()
  return json(request, env, { ok: true, id: requestId, status: 'open' }, 201)
}

async function listRequests(request: Request, env: Env, url: URL) {
  const deviceId = clean(url.searchParams.get('deviceId'), 100)
  if (!deviceId) return error(request, env, 'device_required', 400, 'Потрібен deviceId.')
  const result = await env.DB.prepare(`SELECT pr.*,COUNT(so.id) offer_count,MIN(so.price+so.delivery_price) best_offer FROM purchase_requests pr LEFT JOIN seller_offers so ON so.request_id=pr.id AND so.status='active' WHERE pr.device_id=?1 GROUP BY pr.id ORDER BY pr.created_at DESC`).bind(deviceId).all()
  return json(request, env, { items: result.results || [] })
}

async function listSellerOffers(request: Request, env: Env, requestId: string) {
  const result = await env.DB.prepare(`SELECT so.*,s.name store_name,s.reliability_score FROM seller_offers so JOIN stores s ON s.id=so.store_id WHERE so.request_id=?1 AND so.status='active' ORDER BY so.price+so.delivery_price ASC`).bind(requestId).all()
  return json(request, env, { items: result.results || [] })
}

function validSecret(request: Request, env: Env) {
  const supplied = request.headers.get('x-ingest-secret') || ''
  return Boolean(env.INGEST_SECRET && supplied && supplied === env.INGEST_SECRET)
}

async function ingestOffer(request: Request, env: Env) {
  if (!validSecret(request, env)) return error(request, env, 'unauthorized', 401, 'Невірний ingest secret.')
  const body = await readJson<IngestBody>(request)
  const storeName = clean(body?.store?.name, 120), externalSku = clean(body?.externalSku, 160)
  const productName = clean(body?.product?.name || body?.titleRaw, 300), externalUrl = clean(body?.externalUrl, 1000)
  const price = asNumber(body?.price), deliveryPrice = asNumber(body?.deliveryPrice) ?? 0
  if (!storeName || !externalSku || !productName || !externalUrl || !price || price <= 0 || deliveryPrice < 0) return error(request, env, 'invalid_offer', 400, 'Не вистачає обов’язкових полів пропозиції.')
  try { new URL(externalUrl) } catch { return error(request, env, 'invalid_url', 400, 'externalUrl має бути коректним URL.') }

  const storeSlug = slugify(body?.store?.slug || storeName)
  let store = await env.DB.prepare('SELECT id FROM stores WHERE slug=?1 OR domain=?2 LIMIT 1').bind(storeSlug, clean(body?.store?.domain, 160) || null).first<{ id: string }>()
  if (!store) {
    store = { id: newId('store') }
    await env.DB.prepare('INSERT INTO stores(id,name,slug,domain,reliability_score) VALUES(?1,?2,?3,?4,?5)').bind(store.id, storeName, storeSlug, clean(body?.store?.domain, 160) || null, clamp(asNumber(body?.store?.reliabilityScore) ?? 80, 0, 100)).run()
  }

  const product = await matchOrCreateProduct(env, body?.product || {}, productName)
  let locationId: string | null = null
  if (body?.location?.address) {
    locationId = clean(body.location.id, 100) || `${store.id}_${slugify(body.location.address)}`
    await env.DB.prepare(`INSERT INTO store_locations(id,store_id,name,address,city,lat,lng) VALUES(?1,?2,?3,?4,?5,?6,?7) ON CONFLICT(id) DO UPDATE SET name=excluded.name,address=excluded.address,city=excluded.city,lat=excluded.lat,lng=excluded.lng`).bind(locationId, store.id, clean(body.location.name, 160) || null, clean(body.location.address, 300), clean(body.location.city, 100) || null, asNumber(body.location.lat) ?? null, asNumber(body.location.lng) ?? null).run()
  }

  const previous = await env.DB.prepare('SELECT id,price,old_price FROM offers WHERE store_id=?1 AND external_sku=?2').bind(store.id, externalSku).first<{ id: string; price: number; old_price: number | null }>()
  const offerId = previous?.id || newId('offer')
  const oldPrice = asNumber(body?.oldPrice) ?? (previous && previous.price !== price ? previous.price : previous?.old_price) ?? null
  const availability: Availability = ['in_stock','out_of_stock','preorder','unknown'].includes(body?.availability || '') ? body!.availability! : 'in_stock'
  await env.DB.prepare(`INSERT INTO offers(id,product_id,store_id,store_location_id,external_sku,title_raw,external_url,price,old_price,delivery_price,availability) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11) ON CONFLICT(store_id,external_sku) DO UPDATE SET product_id=excluded.product_id,store_location_id=excluded.store_location_id,title_raw=excluded.title_raw,external_url=excluded.external_url,price=excluded.price,old_price=excluded.old_price,delivery_price=excluded.delivery_price,availability=excluded.availability,checked_at=CURRENT_TIMESTAMP`)
    .bind(offerId, product.id, store.id, locationId, externalSku, clean(body?.titleRaw || productName, 500), externalUrl, price, oldPrice, deliveryPrice, availability).run()
  if (!previous && oldPrice && oldPrice !== price) {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO price_history(offer_id,price,captured_at) VALUES(?1,?2,datetime('now','-1 day'))").bind(offerId, oldPrice),
      env.DB.prepare('INSERT INTO price_history(offer_id,price) VALUES(?1,?2)').bind(offerId, price)
    ])
  } else if (!previous || previous.price !== price) {
    await env.DB.prepare('INSERT INTO price_history(offer_id,price) VALUES(?1,?2)').bind(offerId, price).run()
  }
  await recalculateOffer(env, offerId)
  return json(request, env, { ok: true, offerId, productId: product.id, matched: product.matched }, previous ? 200 : 201)
}

async function matchOrCreateProduct(env: Env, input: NonNullable<IngestBody['product']>, productName: string) {
  const gtin = clean(input.gtin, 32), mpn = clean(input.mpn, 100), brand = clean(input.brand, 100), model = clean(input.model, 160)
  let row: { id: string } | null = null
  if (gtin) row = await env.DB.prepare('SELECT id FROM products WHERE gtin=?1 LIMIT 1').bind(gtin).first<{ id: string }>()
  if (!row && mpn && brand) row = await env.DB.prepare('SELECT id FROM products WHERE lower(brand)=lower(?1) AND lower(mpn)=lower(?2) LIMIT 1').bind(brand, mpn).first<{ id: string }>()
  if (!row && brand && model) {
    const candidates = await env.DB.prepare('SELECT id,brand,model FROM products WHERE lower(brand)=lower(?1)').bind(brand).all<{ id: string; brand: string; model: string }>()
    row = candidates.results?.find(item => normalize(item.model || '') === normalize(model)) || null
  }
  if (row) return { id: row.id, matched: true }
  const productId = newId('prod')
  let slug = slugify(`${brand} ${model || productName}`)
  const collision = await env.DB.prepare('SELECT id FROM products WHERE slug=?1').bind(slug).first()
  if (collision) slug = `${slug}-${productId.slice(-6)}`
  await env.DB.prepare('INSERT INTO products(id,slug,name,brand,model,variant,category,gtin,mpn,image_url,description) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)')
    .bind(productId, slug, productName, brand || null, model || null, clean(input.variant, 160) || null, clean(input.category, 100) || null, gtin || null, mpn || null, clean(input.imageUrl, 1000) || null, clean(input.description, 2000) || null).run()
  return { id: productId, matched: false }
}

async function recalculateAll(env: Env) {
  const offers = await env.DB.prepare("SELECT id FROM offers WHERE availability IN ('in_stock','preorder')").all<{ id: string }>()
  for (const offer of offers.results || []) await recalculateOffer(env, offer.id)
  return offers.results?.length || 0
}

async function recalculateOffer(env: Env, offerId: string) {
  const offer = await env.DB.prepare(`SELECT o.id,o.product_id,o.price,o.delivery_price,s.reliability_score,(SELECT MIN(price+delivery_price) FROM offers WHERE product_id=o.product_id AND availability='in_stock') competitor_min FROM offers o JOIN stores s ON s.id=o.store_id WHERE o.id=?1`).bind(offerId).first<{ id: string; product_id: string; price: number; delivery_price: number; reliability_score: number; competitor_min: number }>()
  if (!offer) return
  const history = await env.DB.prepare(`SELECT AVG(CASE WHEN captured_at>=datetime('now','-30 days') THEN price END) avg_30,MIN(CASE WHEN captured_at>=datetime('now','-180 days') THEN price END) min_180 FROM price_history WHERE offer_id=?1`).bind(offerId).first<{ avg_30: number | null; min_180: number | null }>()
  const avg30 = history?.avg_30 || offer.price, min180 = history?.min_180 || offer.price
  const discount = avg30 > 0 ? ((avg30 - offer.price) / avg30) * 100 : 0
  const trendPoints = clamp(discount / 20, 0, 1) * 35
  const historyPoints = clamp(min180 / offer.price, 0, 1) * 30
  const competitorPoints = clamp((offer.competitor_min / (offer.price + offer.delivery_price)) || 0, 0, 1) * 20
  const deliveryPoints = clamp(1 - offer.delivery_price / Math.max(offer.price * 0.08, 1), 0, 1) * 10
  const trustPoints = clamp(offer.reliability_score / 100, 0, 1) * 5
  const score = Math.round(clamp(trendPoints + historyPoints + competitorPoints + deliveryPoints + trustPoints, 0, 100))
  await env.DB.prepare(`INSERT INTO deal_scores(offer_id,score,avg_30,min_180,real_discount_pct) VALUES(?1,?2,?3,?4,?5) ON CONFLICT(offer_id) DO UPDATE SET score=excluded.score,avg_30=excluded.avg_30,min_180=excluded.min_180,real_discount_pct=excluded.real_discount_pct,calculated_at=CURRENT_TIMESTAMP`).bind(offerId, score, avg30, min180, discount).run()
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = (degrees: number) => degrees * Math.PI / 180
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)) * 10) / 10
}

export interface Env {
  DB: D1Database
  APP_ORIGIN: string
}

type Json = Record<string, unknown> | unknown[]

const json = (data: Json, status = 200, extra: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type':'application/json; charset=utf-8', ...extra }
})

const cors = (env: Env) => ({
  'access-control-allow-origin': env.APP_ORIGIN || '*',
  'access-control-allow-methods':'GET,POST,OPTIONS',
  'access-control-allow-headers':'content-type,authorization'
})

const id = (prefix:string) => `${prefix}_${crypto.randomUUID().replaceAll('-','')}`

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const headers = cors(env)
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers})

    try {
      if (url.pathname === '/api/health') return json({ ok:true, service:'vyhidno-api', version:'0.1.0' }, 200, headers)

      if (url.pathname === '/api/products' && request.method === 'GET') {
        const q = `%${(url.searchParams.get('q') || '').trim()}%`
        const rs = await env.DB.prepare(`SELECT id, slug, name, brand, category, gtin, image_url FROM products WHERE name LIKE ? OR brand LIKE ? ORDER BY updated_at DESC LIMIT 20`).bind(q,q).all()
        return json(rs.results,200,headers)
      }

      if (url.pathname.startsWith('/api/products/') && request.method === 'GET') {
        const slug = decodeURIComponent(url.pathname.split('/').pop() || '')
        const product = await env.DB.prepare(`SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1`).bind(slug,slug).first()
        if (!product) return json({error:'product_not_found'},404,headers)
        const offers = await env.DB.prepare(`SELECT o.*, s.name store_name, ds.score, ds.avg_30, ds.min_180, ds.real_discount_pct FROM offers o JOIN stores s ON s.id=o.store_id LEFT JOIN deal_scores ds ON ds.offer_id=o.id WHERE o.product_id=? ORDER BY o.price ASC`).bind(product.id).all()
        return json({product, offers:offers.results},200,headers)
      }

      if (url.pathname === '/api/deals' && request.method === 'GET') {
        const rs = await env.DB.prepare(`SELECT p.id product_id, p.slug, p.name, p.brand, p.category, o.id offer_id, o.price, o.old_price, s.name store_name, ds.score, ds.real_discount_pct FROM offers o JOIN products p ON p.id=o.product_id JOIN stores s ON s.id=o.store_id JOIN deal_scores ds ON ds.offer_id=o.id WHERE ds.score >= 70 ORDER BY ds.score DESC, ds.real_discount_pct DESC LIMIT 50`).all()
        return json(rs.results,200,headers)
      }

      if (url.pathname === '/api/map/deals' && request.method === 'GET') {
        const rs = await env.DB.prepare(`SELECT p.id product_id, p.name, p.category, o.price, o.old_price, s.name store_name, sl.name location_name, sl.address, sl.lat, sl.lng, ds.score, ds.real_discount_pct FROM offers o JOIN products p ON p.id=o.product_id JOIN stores s ON s.id=o.store_id JOIN store_locations sl ON sl.id=o.store_location_id LEFT JOIN deal_scores ds ON ds.offer_id=o.id WHERE sl.lat IS NOT NULL AND sl.lng IS NOT NULL ORDER BY ds.score DESC LIMIT 100`).all()
        return json(rs.results,200,headers)
      }

      if (url.pathname === '/api/requests' && request.method === 'POST') {
        const body = await request.json<{productText?:string,budget?:number,deadline?:string,comment?:string,userId?:string}>()
        if (!body.productText || !body.budget || body.budget <= 0) return json({error:'invalid_request'},400,headers)
        const requestId = id('req')
        await env.DB.prepare(`INSERT INTO purchase_requests (id,user_id,product_text,budget,deadline,comment) VALUES (?,?,?,?,?,?)`).bind(requestId,body.userId||null,body.productText,body.budget,body.deadline||null,body.comment||null).run()
        return json({ok:true,id:requestId,status:'open'},201,headers)
      }

      if (url.pathname.startsWith('/api/requests/') && url.pathname.endsWith('/offers') && request.method === 'GET') {
        const requestId = url.pathname.split('/')[3]
        const rs = await env.DB.prepare(`SELECT so.*, s.name store_name FROM seller_offers so JOIN stores s ON s.id=so.store_id WHERE so.request_id=? AND so.status='active' ORDER BY (so.price + so.delivery_price) ASC`).bind(requestId).all()
        return json(rs.results,200,headers)
      }

      return json({error:'not_found'},404,headers)
    } catch (error) {
      console.error(error)
      return json({error:'internal_error'},500,headers)
    }
  }
}

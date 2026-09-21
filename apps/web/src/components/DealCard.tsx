import { ArrowDownRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Deal } from '../lib/api'
import { money, pctDrop } from '../lib/format'

export default function DealCard({deal}:{deal:Deal}){
  const drop = deal.real_discount_pct ?? (deal.old_price ? pctDrop(deal.old_price,deal.price) : 0)
  return <Link className="deal-card" to={`/product/${deal.slug || deal.id}`}>
    <div className="deal-thumb">{deal.image_url ? <img src={deal.image_url} alt=""/> : deal.category === 'Продукти' ? '🛒' : deal.category === 'Тварини' ? '🐶' : deal.category === 'Дім' ? '🏠' : '🎧'}</div>
    <div className="deal-main">
      <div className="deal-topline"><span className="deal-badge"><ArrowDownRight size={14}/>{drop > 0 ? `−${Math.round(drop)}%` : 'Хороша ціна'}</span><span className="score"><Star size={14} fill="currentColor"/> {deal.score}</span></div>
      <h3>{deal.name}</h3><p>{deal.variant || deal.model || deal.brand}</p>
      <div className="deal-bottom"><div><strong>{money(deal.price)}</strong>{deal.old_price ? <s>{money(deal.old_price)}</s> : null}</div><div className="store">{deal.store_name}{deal.distance_km != null && <span><MapPin size={13}/>{deal.distance_km.toFixed(1)} км</span>}</div></div>
    </div>
  </Link>
}

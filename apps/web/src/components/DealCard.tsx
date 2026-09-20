import { ArrowDownRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Deal } from '../data/mock'
import { money, pctDrop } from '../lib/format'

export default function DealCard({deal}:{deal:Deal}){
  return <Link className="deal-card" to={`/product/${deal.id}`}>
    <div className="deal-thumb">{deal.category === 'Продукти' ? '🛒' : deal.category === 'Тварини' ? '🐶' : deal.category === 'Дім' ? '🏠' : '🎧'}</div>
    <div className="deal-main">
      <div className="deal-topline"><span className="deal-badge"><ArrowDownRight size={14}/>{deal.badge || `−${pctDrop(deal.oldPrice,deal.price)}%`}</span><span className="score"><Star size={14} fill="currentColor"/> {deal.score}</span></div>
      <h3>{deal.title}</h3><p>{deal.subtitle}</p>
      <div className="deal-bottom"><div><strong>{money(deal.price)}</strong><s>{money(deal.oldPrice)}</s></div><div className="store">{deal.store}{deal.distance && <span><MapPin size={13}/>{deal.distance}</span>}</div></div>
    </div>
  </Link>
}

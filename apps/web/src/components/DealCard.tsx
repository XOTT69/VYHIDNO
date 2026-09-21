import { ArrowDownRight, ArrowUpRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProductSummary } from '../lib/api'
import { money } from '../lib/format'
import ProductVisual from './ProductVisual'

export default function DealCard({deal}:{deal:ProductSummary}){
  const drop = deal.real_discount_pct ?? 0
  return <Link className="deal-card" to={`/product/${deal.slug || deal.id}`}>
    <ProductVisual className="deal-thumb" image={deal.image_url} category={deal.category} name={deal.name}/>
    <div className="deal-main">
      <div className="deal-topline"><span className="deal-badge">{deal.price!=null?<><ArrowDownRight size={14}/>{drop > 0 ? `−${Math.round(drop)}%` : 'Свіжа пропозиція'}</>:'Точна картка товару'}</span>{deal.price!=null&&deal.score!=null&&<span className="score"><Star size={14} fill="currentColor"/> {deal.score}</span>}</div>
      <h3>{deal.name}</h3><p>{deal.variant || deal.model || deal.brand}</p>
      <div className="deal-bottom"><div><strong>{deal.price!=null?money(deal.price):'Ціна в магазині'}</strong></div><div className="store"><span className="store-name">{deal.store_name||deal.reference_store}</span>{deal.distance_km != null && <span><MapPin size={13}/>{deal.distance_km.toFixed(1)} км</span>}</div></div>
      <div className="deal-cta"><span>{deal.price!=null?'Порівняти пропозиції':'Перейти до товару'}</span><ArrowUpRight size={17}/></div>
    </div>
  </Link>
}

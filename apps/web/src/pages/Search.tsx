import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, ArrowRight } from 'lucide-react'
import { product, deals } from '../data/mock'
import DealCard from '../components/DealCard'

export default function Search(){
 const [params]=useSearchParams(); const q=params.get('q')||''
 return <section className="container page"><div className="page-title"><span><SearchIcon size={16}/> Результати</span><h1>{q}</h1><p>Поки це demo-matching. На наступному етапі тут працюватиме реальний каталог і зіставлення пропозицій магазинів.</p></div><Link to="/product/monge-15" className="search-result"><div className="deal-thumb">✨</div><div><b>{product.name}</b><span>{product.variant}</span></div><strong>{product.price.toLocaleString('uk-UA')} грн</strong><ArrowRight/></Link><div className="section-head compact"><h2>Схожі вигідні пропозиції</h2></div><div className="deal-grid">{deals.slice(0,3).map(d=><DealCard key={d.id} deal={d}/>)}</div></section>
}

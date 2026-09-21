import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import DealCard from '../components/DealCard'
import { api, errorMessage, type ProductSummary } from '../lib/api'
import { useEffect, useState } from 'react'

export default function Search(){
  const [params,setParams]=useSearchParams()
  const query=params.get('q')||''
  const [draft,setDraft]=useState(query)
  const [items,setItems]=useState<ProductSummary[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  useEffect(()=>{
    setDraft(query)
    if(query.trim().length<2){setItems([]);return}
    setLoading(true);setError('')
    api.products(query).then(result=>setItems(result.items)).catch(cause=>setError(errorMessage(cause))).finally(()=>setLoading(false))
  },[query])
  const submit=(event:React.FormEvent)=>{event.preventDefault();if(draft.trim().length>=2)setParams({q:draft.trim()})}
  return <section className="container page"><div className="page-title"><span><SearchIcon size={16}/> Каталог</span><h1>{query||'Знайти товар'}</h1><p>Пошук працює за назвою, брендом, моделлю, GTIN/EAN та артикулом виробника.</p></div><form className="search-box search-page-box" onSubmit={submit}><SearchIcon size={22}/><input aria-label="Пошук товару" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Наприклад: AirPods Pro або 0195949052651"/><button type="submit">Знайти</button></form>{loading?<div className="loading-state">Шукаємо найкращі ціни…</div>:error?<div className="error-state">{error}</div>:query&&items.length===0?<div className="empty-state">Нічого не знайдено. Спробуй бренд і модель без зайвих слів.</div>:<div className="deal-grid search-grid">{items.map(item=><DealCard key={item.id} deal={item}/>)}</div>}</section>
}

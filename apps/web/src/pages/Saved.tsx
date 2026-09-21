import { Bell, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, errorMessage, type WatchItem } from '../lib/api'
import { money } from '../lib/format'
import { useEffect, useState } from 'react'
import ProductVisual from '../components/ProductVisual'

export default function Saved(){
  const [items,setItems]=useState<WatchItem[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=()=>{setLoading(true);api.watchlist().then(result=>setItems(result.items)).catch(cause=>setError(errorMessage(cause))).finally(()=>setLoading(false))}
  useEffect(load,[])
  const remove=async(id:string)=>{try{await api.unwatch(id);setItems(current=>current.filter(item=>item.id!==id))}catch(cause){setError(errorMessage(cause))}}
  return <section className="container page narrow"><div className="page-title"><span>♡ Моє</span><h1>Стежимо за цінами</h1><p>Тут зберігаються товари та цільові ціни цього пристрою. Автоматичних сповіщень поки немає — перевіряй список вручну.</p></div>{error&&<div className="error-state">{error}</div>}{loading?<div className="loading-state">Завантажуємо список…</div>:items.length===0?<div className="empty-state">Список порожній. Відкрий товар і задай цільову ціну.</div>:<div className="watch-list">{items.map(item=><div className="watch-card" key={item.id}><ProductVisual className="deal-thumb" image={item.image_url} category={item.category} name={item.name}/><div className="watch-main"><Link to={`/product/${item.slug}`}><b>{item.name}</b></Link><span>Зараз {item.price?money(item.price):'немає пропозицій'}</span><div className="target"><Bell size={16}/> Цільова ціна ≤ <strong>{item.target_price?money(item.target_price):'будь-яке падіння'}</strong></div></div><button className="icon-btn" onClick={()=>remove(item.id)} aria-label={`Видалити ${item.name}`}><Trash2 size={18}/></button></div>)}</div>}</section>
}

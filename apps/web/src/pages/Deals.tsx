import { useEffect, useState } from 'react'
import DealCard from '../components/DealCard'
import { api, errorMessage, type Deal } from '../lib/api'

export default function Deals(){
  const categories=['Усі','Техніка','Продукти','Дім','Тварини']
  const [category,setCategory]=useState('Усі')
  const [items,setItems]=useState<Deal[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    setLoading(true);setError('')
    api.deals(category==='Усі'?'':category).then(result=>setItems(result.items)).catch(cause=>setError(errorMessage(cause))).finally(()=>setLoading(false))
  },[category])
  return <section className="container page"><div className="page-title"><span>↘ Перевірені пропозиції</span><h1>Що сьогодні подешевшало?</h1><p>Показуємо реальне падіння ціни відносно історії, а не рекламний відсоток магазину.</p></div><div className="chips">{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={category===item?'chip active':'chip'}>{item}</button>)}</div>{loading?<div className="loading-state">Оновлюємо пропозиції…</div>:error?<div className="error-state">{error}</div>:items.length?<div className="deal-grid">{items.map(deal=><DealCard key={deal.id} deal={deal}/>)}</div>:<div className="empty-state">Підтверджених пропозицій у цій категорії поки немає. Демонстраційні ціни тут не показуємо.</div>}</section>
}

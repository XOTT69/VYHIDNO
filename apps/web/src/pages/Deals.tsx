import { useMemo, useState } from 'react'
import DealCard from '../components/DealCard'
import { deals } from '../data/mock'

export default function Deals(){
  const cats=['Усі','Техніка','Продукти','Дім','Тварини']
  const [cat,setCat]=useState('Усі')
  const list=useMemo(()=>cat==='Усі'?deals:deals.filter(d=>d.category===cat),[cat])
  return <section className="container page"><div className="page-title"><span>🔥 Live Deals</span><h1>Що сьогодні подешевшало?</h1><p>Показуємо реальне падіння ціни відносно історії, а не рекламний відсоток магазину.</p></div><div className="chips">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'chip active':'chip'}>{c}</button>)}</div><div className="deal-grid">{list.map(d=><DealCard key={d.id} deal={d}/>)}</div></section>
}

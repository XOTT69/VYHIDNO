import { ArrowRight, Bell, MapPinned, Search, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DealCard from '../components/DealCard'
import { api, errorMessage, type Deal } from '../lib/api'
import { useEffect, useState } from 'react'

export default function Home(){
  const [q,setQ]=useState('')
  const [deals,setDeals]=useState<Deal[]>([])
  const [error,setError]=useState('')
  const nav=useNavigate()
  const go=()=>{if(q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)}
  useEffect(()=>{api.deals('',4).then(result=>setDeals(result.items)).catch(cause=>setError(errorMessage(cause)))},[])
  return <>
    <section className="hero container">
      <div className="eyebrow"><Sparkles size={16}/> Розумний shopping assistant</div>
      <h1>Перед покупкою —<br/><span>перевір VYHIDNO.</span></h1>
      <p className="hero-copy">Знайдемо реальну найкращу ціну, покажемо історію, знижки поруч і дамо магазинам поборотися за тебе.</p>
      <div className="search-box"><Search size={22}/><input aria-label="Пошук товару" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Товар, модель, GTIN або артикул…"/><button onClick={go}>Знайти <ArrowRight size={18}/></button></div>
      <div className="quick-actions"><Link to="/deals">🔥 Реальні знижки</Link><Link to="/map"><MapPinned size={18}/> Знижки поруч</Link><Link to="/my-price">💸 Назвати свою ціну</Link></div>
    </section>
    <section className="container value-grid">
      <Link to="/deals" className="value-card lime"><div className="icon-ball">🔥</div><div><h3>Подешевшало сьогодні</h3><p>Не “намальовані” −70%, а реальні падіння ціни.</p></div><ArrowRight/></Link>
      <Link to="/map" className="value-card"><div className="icon-ball">📍</div><div><h3>DealMap</h3><p>Вигідні покупки прямо поруч з тобою.</p></div><ArrowRight/></Link>
      <Link to="/my-price" className="value-card dark"><div className="icon-ball">💸</div><div><h3>Назви свою ціну</h3><p>Нехай магазини конкурують за твою покупку.</p></div><ArrowRight/></Link>
    </section>
    <section className="container section"><div className="section-head"><div><span>Зараз вигідно</span><h2>Ціни, які реально впали</h2></div><Link to="/deals">Дивитися всі <ArrowRight size={16}/></Link></div>{error?<div className="error-state">API недоступний: {error}</div>:deals.length?<div className="deal-grid">{deals.map(deal=><DealCard key={deal.id} deal={deal}/>)}</div>:<div className="loading-state">Завантажуємо актуальні пропозиції…</div>}</section>
    <section className="container feature-banner"><div><div className="eyebrow"><Bell size={16}/> Watchlist</div><h2>Не стеж за ціною.<br/>Ми зробимо це за тебе.</h2><p>Задай бажану ціну — товар збережеться у твоєму списку відстеження.</p><Link className="primary-btn" to="/saved">Мої товари <ArrowRight size={18}/></Link></div><div className="phone-card"><div className="mini-notification"><span>🔥</span><div><b>Чесне порівняння</b><p>Ураховуємо ціну доставки</p></div></div><div className="mini-notification"><span>⚡</span><div><b>Історія цін</b><p>Оцінка формується з фактичних даних</p></div></div></div></section>
  </>
}

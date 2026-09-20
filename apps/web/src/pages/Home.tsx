import { ArrowRight, Bell, Camera, Link as LinkIcon, MapPinned, Search, Sparkles, Tags } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { deals } from '../data/mock'
import DealCard from '../components/DealCard'
import { useState } from 'react'

export default function Home(){
  const [q,setQ]=useState('')
  const nav=useNavigate()
  const go=()=>{if(q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)}
  return <>
    <section className="hero container">
      <div className="eyebrow"><Sparkles size={16}/> Розумний shopping assistant</div>
      <h1>Перед покупкою —<br/><span>перевір VYHIDNO.</span></h1>
      <p className="hero-copy">Знайдемо реальну найкращу ціну, покажемо історію, знижки поруч і дамо магазинам поборотися за тебе.</p>
      <div className="search-box"><Search size={22}/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Що хочеш купити? Товар, модель або посилання…"/><button onClick={go}>Знайти <ArrowRight size={18}/></button></div>
      <div className="quick-actions">
        <button><LinkIcon size={18}/> Вставити посилання</button><button><Camera size={18}/> Знайти по фото</button><Link to="/map"><MapPinned size={18}/> Знижки поруч</Link>
      </div>
    </section>
    <section className="container value-grid">
      <Link to="/deals" className="value-card lime"><div className="icon-ball">🔥</div><div><h3>Подешевшало сьогодні</h3><p>Не “намальовані” −70%, а реальні падіння ціни.</p></div><ArrowRight/></Link>
      <Link to="/map" className="value-card"><div className="icon-ball">📍</div><div><h3>DealMap</h3><p>Вигідні покупки прямо поруч з тобою.</p></div><ArrowRight/></Link>
      <Link to="/my-price" className="value-card dark"><div className="icon-ball">💸</div><div><h3>Назви свою ціну</h3><p>Нехай магазини конкурують за твою покупку.</p></div><ArrowRight/></Link>
    </section>
    <section className="container section"><div className="section-head"><div><span>Зараз вигідно</span><h2>Ціни, які реально впали</h2></div><Link to="/deals">Дивитися всі <ArrowRight size={16}/></Link></div><div className="deal-grid">{deals.slice(0,4).map(d=><DealCard key={d.id} deal={d}/>)}</div></section>
    <section className="container feature-banner"><div><div className="eyebrow"><Bell size={16}/> Watchlist</div><h2>Не стеж за ціною.<br/>Ми зробимо це за тебе.</h2><p>Задай бажану ціну — повідомимо, коли товар стане вигідним.</p><Link className="primary-btn" to="/saved">Мої товари <ArrowRight size={18}/></Link></div><div className="phone-card"><div className="mini-notification"><span>🔥</span><div><b>Ціна впала!</b><p>Monge 15 кг — 2 690 грн</p></div></div><div className="mini-notification"><span>⚡</span><div><b>Історичний мінімум</b><p>AirPods Pro — 6 899 грн</p></div></div></div></section>
  </>
}

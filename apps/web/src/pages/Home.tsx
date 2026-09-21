import { ArrowRight, BadgeCheck, Bell, MapPinned, Search, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DealCard from '../components/DealCard'
import { api, errorMessage, type Deal, type ProductSummary } from '../lib/api'
import { useEffect, useState } from 'react'

export default function Home(){
  const [q,setQ]=useState('')
  const [deals,setDeals]=useState<Deal[]>([])
  const [catalog,setCatalog]=useState<ProductSummary[]>([])
  const [error,setError]=useState('')
  const nav=useNavigate()
  const go=()=>{if(q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)}
  useEffect(()=>{api.deals('',4).then(result=>setDeals(result.items)).catch(cause=>setError(errorMessage(cause)))},[])
  useEffect(()=>{api.products().then(result=>setCatalog(result.items.slice(0,4))).catch(()=>{})},[])
  return <>
    <section className="hero-wrap"><div className="hero container">
      <div className="hero-content"><div className="eyebrow"><Sparkles size={16}/> Ціна без маркетингових трюків</div>
      <h1>Купуй тоді,<br/>коли справді <span>вигідно.</span></h1>
      <p className="hero-copy">Порівнюємо точні пропозиції магазинів, доставку та історію ціни. Один клік — і ти вже на сторінці саме цього товару.</p>
      <div className="search-box"><Search size={22}/><input aria-label="Пошук товару" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Що шукаєш? Модель, штрихкод або назва"/><button onClick={go}>Знайти <ArrowRight size={18}/></button></div>
      <div className="quick-actions"><Link to="/deals"><TrendingDown size={17}/> Реальні знижки</Link><Link to="/map"><MapPinned size={17}/> Поруч зі мною</Link><Link to="/my-price">Назвати свою ціну <ArrowRight size={15}/></Link></div></div>
      <aside className="hero-proof" aria-label="Як працює VYHIDNO"><div className="proof-orbit"><span>V</span><b>✓</b><small>VYHIDNO<br/>перевіряє</small></div><div className="proof-row"><ShieldCheck/><div><b>Перевіряємо знижку</b><span>Проти історії ціни, а не перекресленої цифри</span></div></div><div className="proof-row"><BadgeCheck/><div><b>Точний перехід</b><span>Без головних сторінок і повторного пошуку</span></div></div></aside>
    </div>
    </section>
    <section className="container value-grid">
      <Link to="/deals" className="value-card lime"><div className="value-index">01</div><div><h3>Чесні знижки</h3><p>Відділяємо реальне падіння ціни від рекламного відсотка.</p></div><ArrowRight/></Link>
      <Link to="/map" className="value-card"><div className="value-index">02</div><div><h3>DealMap</h3><p>Показуємо вигідні покупки у фізичних магазинах поруч.</p></div><ArrowRight/></Link>
      <Link to="/my-price" className="value-card dark"><div className="value-index">03</div><div><h3>Твоя ціна</h3><p>Залиш запит із бюджетом. Відповіді продавців з’являться після підключення партнерів.</p></div><ArrowRight/></Link>
    </section>
    <section className="container section"><div className="section-head"><div><span>Зараз вигідно</span><h2>Ціни, які реально впали</h2></div><Link to="/deals">Дивитися всі <ArrowRight size={16}/></Link></div>{error?<div className="error-state">API недоступний: {error}</div>:deals.length?<div className="deal-grid">{deals.map(deal=><DealCard key={deal.id} deal={deal}/>)}</div>:<div className="empty-state"><h3>Збираємо підтверджені пропозиції</h3><p>Демонстраційні ціни прибрані. Показуватимемо лише пропозиції з точним посиланням на товар і свіжими даними магазину.</p><Link className="secondary-btn" to="/my-price">Назвати свою ціну <ArrowRight size={16}/></Link></div>}</section>
    {catalog.length>0&&<section className="container section catalog-section"><div className="section-head"><div><span>Відкрити в магазині</span><h2>Точні сторінки товарів</h2></div><Link to="/search">Пошук <ArrowRight size={16}/></Link></div><p className="catalog-intro">Ці товари знайдені в каталогах магазинів. Ціну й наявність покаже сам магазин — поки ми не отримали його feed, не вгадуємо їх.</p><div className="deal-grid">{catalog.map(item=><DealCard key={item.id} deal={item}/>)}</div></section>}
    <section className="container feature-banner"><div><div className="eyebrow"><Bell size={16}/> Мій список</div><h2>Улюблені товари<br/>завжди під рукою.</h2><p>Збережи товар і цільову ціну. Повертайся до списку, щоб перевірити оновлені пропозиції.</p><Link className="primary-btn" to="/saved">Мої товари <ArrowRight size={18}/></Link></div><div className="phone-card"><div className="mini-notification"><span>✓</span><div><b>Чесне порівняння</b><p>Ураховуємо ціну доставки</p></div></div><div className="mini-notification"><span>↗</span><div><b>Точне посилання</b><p>Одразу на сторінку конкретного товару</p></div></div></div></section>
  </>
}

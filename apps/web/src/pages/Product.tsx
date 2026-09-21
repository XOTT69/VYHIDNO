import { ArrowLeft, Bell, Check, ExternalLink, ShieldCheck, Star, Truck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PriceChart from '../components/PriceChart'
import ProductVisual from '../components/ProductVisual'
import { api, errorMessage, type ProductDetails } from '../lib/api'
import { money } from '../lib/format'
import { useEffect, useMemo, useState } from 'react'

export default function Product(){
  const {id=''}=useParams()
  const navigate=useNavigate()
  const [data,setData]=useState<ProductDetails|null>(null)
  const [error,setError]=useState('')
  const [target,setTarget]=useState(0)
  const [notice,setNotice]=useState('')
  useEffect(()=>{
    setData(null);setError('')
    api.product(id).then(result=>{
      setData(result)
      const best=result.offers.find(item=>item.availability==='in_stock')||result.offers[0]
      setTarget(best?Math.round(best.price*.92):0)
    }).catch(cause=>setError(errorMessage(cause)))
  },[id])
  const best=useMemo(()=>data?.offers.find(item=>item.availability==='in_stock')||data?.offers[0],[data])
  if(error)return <section className="container page"><div className="error-state">{error}</div></section>
  if(!data)return <section className="container page"><div className="loading-state">Завантажуємо товар…</div></section>
  if(!best)return <section className="container page product-page">
    <button className="back-link" onClick={()=>window.history.length>1?navigate(-1):navigate('/search')}><ArrowLeft size={17}/> Назад до результатів</button>
    <div className="product-hero"><ProductVisual className="product-picture" image={data.product.image_url} category={data.product.category} name={data.product.name}/><div className="product-info"><span className="crumb">{data.product.category||'Каталог'} · {data.product.brand||'Товар'}</span><h1>{data.product.name}</h1><p>{data.product.variant||data.product.description}</p><div className="reference-note"><ShieldCheck size={20}/><div><b>Точне посилання без вигаданої ціни</b><span>Зараз немає свіжого feed цього магазину. Актуальну ціну й наявність перевір на його сторінці.</span></div></div>{data.product.reference_url&&<a className="buy-button" href={data.product.reference_url} target="_blank" rel="noopener noreferrer">Відкрити в {data.product.reference_store||'магазині'} <ExternalLink size={18}/></a>}</div></div>
  </section>

  const score=best.score??50,avg=best.avg_30??best.price,low=best.min_180??best.price
  const available=best.availability==='in_stock'||best.availability==='preorder'
  const watch=async()=>{
    try{await api.watch(data.product.id,target||undefined);setNotice('Товар додано до списку відстеження.')}
    catch(cause){setNotice(errorMessage(cause))}
  }
  return <section className="container page product-page">
    {notice&&<div className="toast" role="status">{notice}</div>}
    <button className="back-link" onClick={()=>window.history.length>1?navigate(-1):navigate('/deals')}><ArrowLeft size={17}/> Назад до результатів</button>
    <div className="product-hero">
      <ProductVisual className="product-picture" image={data.product.image_url} category={data.product.category} name={data.product.name}/>
      <div className="product-info">
        <span className="crumb">{data.product.category||'Каталог'} · {data.product.brand||'Товар'}</span>
        <h1>{data.product.name}</h1>
        <p>{data.product.variant||data.product.description}</p>
        <div className="product-price"><div><small>Найкраща ціна</small><strong>{money(best.price)}</strong></div><span className="big-score"><Star size={17} fill="currentColor"/> {score}/100</span></div>
        <div className="verdict"><Check size={17}/> {score>=85?'Дуже вигідно':score>=70?'Хороша ціна':'Перевір інші пропозиції'} · доставка врахована</div>
        <div className="buy-row">{available?<a className="buy-button" href={best.external_url} target="_blank" rel="noopener noreferrer">Купити в {best.store_name}<ExternalLink size={19}/></a>:<span className="unavailable-button">Зараз немає в наявності</span>}<span className="exact-link-note"><ShieldCheck size={16}/> Відкриється сторінка саме цього товару</span></div>
        <div className="product-actions"><label className="target-input">Цільова ціна<input type="number" min="1" value={target} onChange={event=>setTarget(Number(event.target.value))}/></label><button className="secondary-btn" onClick={watch}><Bell size={18}/> Стежити за ціною</button><Link className="text-action" to={`/my-price?product=${encodeURIComponent(data.product.name)}&productId=${encodeURIComponent(data.product.id)}&budget=${target}`}>Запропонувати свою ціну</Link></div>
      </div>
    </div>
    <div className="stats-grid"><div><span>Зараз</span><b>{money(best.price)}</b><small>{best.store_name}</small></div><div><span>Середня 30 днів</span><b>{data.history.length>1?money(avg):'—'}</b><small>{data.history.length>1?'за історією':'ще немає історії'}</small></div><div><span>Мінімум 6 міс.</span><b>{data.history.length>1?money(low):'—'}</b><small>{data.history.length>1?'зафіксований':'ще немає історії'}</small></div><div className="score-stat"><span>VYHIDNO Score</span><b>{score}/100</b><small>{data.history.length>1?'ціна + доставка':'попередня оцінка'}</small></div></div>
    <div className="two-col">
      <div className="card"><div className="card-head"><div><span>Історія</span><h2>Як змінювалась ціна</h2></div></div><PriceChart values={data.history.map(point=>point.price)}/></div>
      <div className="card offers-card"><div className="card-head"><div><span>{data.offers.length} {data.offers.length===1?'пропозиція':'пропозиції'}</span><h2>Де купити</h2></div></div><div className="offer-list">{data.offers.map((offer,index)=>{
        const canBuy=offer.availability==='in_stock'||offer.availability==='preorder'
        return <a className={`${index===0?'offer best-offer':'offer'} ${!canBuy?'is-unavailable':''}`} key={offer.id} href={offer.external_url} target="_blank" rel="noopener noreferrer" aria-label={`Відкрити точну сторінку товару в ${offer.store_name}`}>
          <div><div className="offer-name"><b>{offer.store_name}</b>{index===0&&<em>Найкраща</em>}</div><span>{canBuy?'В наявності':'Немає в наявності'}</span><span><Truck size={13}/> доставка {offer.delivery_price?money(offer.delivery_price):'безкоштовна'}</span></div>
          <div><strong>{money(offer.price+(offer.delivery_price||0))}</strong><span className="offer-link">{canBuy?'До товару':'Переглянути'} <ExternalLink size={15}/></span></div>
        </a>
      })}</div><div className="trust-note"><ShieldCheck size={18}/> Кожне посилання веде на конкретну картку товару магазину.</div></div>
    </div>
  </section>
}

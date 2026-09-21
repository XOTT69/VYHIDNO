import { Bell, Check, ExternalLink, ShieldCheck, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PriceChart from '../components/PriceChart'
import { api, errorMessage, type ProductDetails } from '../lib/api'
import { money } from '../lib/format'
import { useEffect, useMemo, useState } from 'react'

export default function Product(){
  const {id=''}=useParams()
  const [data,setData]=useState<ProductDetails|null>(null)
  const [error,setError]=useState('')
  const [target,setTarget]=useState<number>(0)
  const [notice,setNotice]=useState('')
  useEffect(()=>{setError('');api.product(id).then(result=>{setData(result);const best=result.offers.find(item=>item.availability==='in_stock')||result.offers[0];setTarget(best?Math.round(best.price*.92):0)}).catch(cause=>setError(errorMessage(cause)))},[id])
  const best=useMemo(()=>data?.offers.find(item=>item.availability==='in_stock')||data?.offers[0],[data])
  if(error)return <section className="container page"><div className="error-state">{error}</div></section>
  if(!data||!best)return <section className="container page"><div className="loading-state">Завантажуємо товар…</div></section>
  const score=best.score??50,avg=best.avg_30??best.price,low=best.min_180??best.price
  const watch=async()=>{try{await api.watch(data.product.id,target||undefined);setNotice('Товар додано до списку відстеження.')}catch(cause){setNotice(errorMessage(cause))}}
  return <section className="container page">{notice&&<div className="toast" role="status">{notice}</div>}<div className="product-hero"><div className="product-picture">{data.product.image_url?<img src={data.product.image_url} alt={data.product.name}/>:data.product.category==='Тварини'?'🐶':'🛍️'}</div><div className="product-info"><span className="crumb">{data.product.category||'Каталог'} / {data.product.brand||'Товар'}</span><h1>{data.product.name}</h1><p>{data.product.variant||data.product.description}</p><div className="product-price"><strong>{money(best.price)}</strong><span className="big-score"><Star size={17} fill="currentColor"/> {score}/100</span></div><div className="verdict"><Check/> {score>=85?'Дуже вигідно':score>=70?'Хороша ціна':'Перевір інші пропозиції'} · доставка врахована у порівнянні</div><div className="product-actions"><label className="target-input">Цільова ціна<input type="number" min="1" value={target} onChange={event=>setTarget(Number(event.target.value))}/></label><button className="primary-btn" onClick={watch}><Bell size={18}/> Стежити</button><Link className="secondary-btn" to={`/my-price?product=${encodeURIComponent(data.product.name)}&productId=${encodeURIComponent(data.product.id)}&budget=${target}`}>Назвати свою ціну</Link></div></div></div><div className="stats-grid"><div><span>Зараз</span><b>{money(best.price)}</b></div><div><span>Середня 30 днів</span><b>{money(avg)}</b></div><div><span>Мінімум 6 міс.</span><b>{money(low)}</b></div><div><span>VYHIDNO Score</span><b>{score}/100</b></div></div><div className="two-col"><div className="card"><div className="card-head"><div><span>Історія</span><h2>Як змінювалась ціна</h2></div></div><PriceChart values={data.history.map(point=>point.price)}/></div><div className="card"><div className="card-head"><div><span>Пропозиції</span><h2>Де купити</h2></div></div><div className="offer-list">{data.offers.map((offer,index)=><div className={index===0?'offer best-offer':'offer'} key={offer.id}><div><b>{offer.store_name}</b><span><Star size={13} fill="currentColor"/> {offer.reliability_score}/100 · {offer.availability==='in_stock'?'в наявності':offer.availability}</span></div><div><strong>{money(offer.price+(offer.delivery_price||0))}</strong><a className="offer-link" href={offer.external_url} target="_blank" rel="noreferrer" aria-label={`Відкрити ${offer.store_name}`}><ExternalLink size={17}/></a></div></div>)}</div><div className="trust-note"><ShieldCheck size={18}/> Sponsored-пропозиції ніколи не підміняють найвигіднішу ціну.</div></div></div></section>
}

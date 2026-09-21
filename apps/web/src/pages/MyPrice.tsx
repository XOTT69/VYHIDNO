import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, RefreshCw, Store } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { money } from '../lib/format'

type SellerOffer={id:string;store_name:string;price:number;delivery_price:number;note?:string}

export default function MyPrice(){
  const [params]=useSearchParams()
  const [productText,setProductText]=useState(params.get('product')||'')
  const [budget,setBudget]=useState(Number(params.get('budget'))||0)
  const [deadline,setDeadline]=useState('today')
  const [comment,setComment]=useState('')
  const [requestId,setRequestId]=useState('')
  const [offers,setOffers]=useState<SellerOffer[]>([])
  const [error,setError]=useState('')
  const [sending,setSending]=useState(false)
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setError('');setSending(true);try{const days=deadline==='today'?0:deadline==='3days'?3:7;const date=new Date();date.setDate(date.getDate()+days);const result=await api.createRequest({productText,productId:params.get('productId')||undefined,budget,deadline:date.toISOString(),comment});setRequestId(result.id)}catch(cause){setError(errorMessage(cause))}finally{setSending(false)}}
  const refresh=async()=>{if(!requestId)return;try{const result=await api.sellerOffers(requestId);setOffers(result.items)}catch(cause){setError(errorMessage(cause))}}
  return <section className="container page narrow"><div className="page-title"><span>💸 Reverse Marketplace</span><h1>Назви свою ціну</h1><p>Ти кажеш, що хочеш купити і скільки готовий заплатити. Магазини надсилають кращі пропозиції.</p></div>{error&&<div className="error-state">{error}</div>}{!requestId?<form className="request-card" onSubmit={submit}><label>Що хочеш купити?<input required minLength={3} placeholder="Наприклад: Samsung Galaxy 256GB" value={productText} onChange={event=>setProductText(event.target.value)}/></label><div className="form-grid"><label>Твій бюджет<input required min="1" type="number" value={budget||''} onChange={event=>setBudget(Number(event.target.value))}/></label><label>Коли готовий купити?<select value={deadline} onChange={event=>setDeadline(event.target.value)}><option value="today">Сьогодні</option><option value="3days">За 3 дні</option><option value="week">Цього тижня</option></select></label></div><label>Коментар<textarea value={comment} onChange={event=>setComment(event.target.value)} placeholder="Колір, доставка, гарантія…"/></label><button className="primary-btn wide" type="submit" disabled={sending}>{sending?'Публікуємо…':'Запустити торги'} <ArrowRight size={18}/></button><p className="form-note">Безкоштовно для покупця. Ідентифікатор пристрою використовується лише для повернення до запиту.</p></form>:<div className="success-card"><CheckCircle2 size={46}/><h2>Запит опубліковано</h2><p>Номер: <code>{requestId}</code>. Коли магазини надішлють пропозиції, вони з’являться тут.</p><button className="secondary-btn refresh-btn" onClick={refresh}><RefreshCw size={17}/> Перевірити пропозиції</button><div className="seller-offers">{offers.map((offer,index)=><div className={index===0?'best':''} key={offer.id}><Store/><span><b>{offer.store_name}</b>{money(offer.price+offer.delivery_price)}{offer.note?` · ${offer.note}`:''}</span></div>)}{!offers.length&&<div className="empty-state compact">Активних пропозицій поки немає.</div>}</div></div>}</section>
}

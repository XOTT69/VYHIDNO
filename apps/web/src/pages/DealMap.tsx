import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { LocateFixed } from 'lucide-react'
import { api, errorMessage, type Deal } from '../lib/api'
import { money } from '../lib/format'
import { useEffect, useState } from 'react'

function Recenter({center}:{center:[number,number]}){const map=useMap();useEffect(()=>{map.setView(center)},[center,map]);return null}

export default function DealMap(){
  const [items,setItems]=useState<Deal[]>([])
  const [center,setCenter]=useState<[number,number]>([50.4501,30.5234])
  const [radius,setRadius]=useState(25)
  const [position,setPosition]=useState<[number,number]|null>(null)
  const [error,setError]=useState('')
  const load=(lat?:number,lng?:number,nextRadius=radius)=>api.mapDeals(lat,lng,nextRadius).then(result=>setItems(result.items)).catch(cause=>setError(errorMessage(cause)))
  useEffect(()=>{load()},[])
  useEffect(()=>{if(position)load(position[0],position[1],radius)},[radius])
  const locate=()=>{
    if(!navigator.geolocation){setError('Цей браузер не підтримує геолокацію.');return}
    navigator.geolocation.getCurrentPosition(({coords})=>{const next:[number,number]=[coords.latitude,coords.longitude];setPosition(next);setCenter(next);setError('');load(next[0],next[1],radius)},()=>setError('Не вдалося отримати геолокацію. Дозволь доступ у налаштуваннях браузера.'),{enableHighAccuracy:false,timeout:8000})
  }
  return <section className="map-page"><div className="map-panel"><span>📍 DealMap</span><h1>Вигода поруч</h1><p>Акції й реальні падіння цін у фізичних магазинах навколо тебе.</p><div className="chips"><button className="chip" onClick={locate}><LocateFixed size={15}/> Моє місце</button>{[5,10,25].map(value=><button key={value} onClick={()=>setRadius(value)} className={radius===value?'chip active':'chip'}>≤ {value} км</button>)}</div>{error&&<div className="error-state compact">{error}</div>}<div className="map-list">{items.slice(0,8).map(item=><Link className="map-row" to={`/product/${item.slug||item.id}`} key={item.id}><div><b>{item.name}</b><span>{item.store_name}{item.distance_km!=null?` · ${item.distance_km.toFixed(1)} км`:''}</span></div><strong>{money(item.price)}</strong></Link>)}{!items.length&&!error&&<div className="loading-state compact">Завантажуємо точки…</div>}</div></div><div className="map-canvas"><MapContainer center={center} zoom={12} scrollWheelZoom style={{height:'100%',width:'100%'}}><Recenter center={center}/><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{position&&<CircleMarker center={position} radius={8} pathOptions={{color:'#2563eb',fillColor:'#60a5fa',fillOpacity:1}}><Popup>Ви тут</Popup></CircleMarker>}{items.filter(item=>item.lat!=null&&item.lng!=null).map(item=><CircleMarker key={`${item.id}-${item.lat}-${item.lng}`} center={[item.lat!,item.lng!]} radius={13} pathOptions={{color:'#101828',fillColor:'#b8ff39',fillOpacity:1,weight:3}}><Popup><b>{item.name}</b><br/>{item.store_name}<br/><strong>{money(item.price)}</strong><br/><Link to={`/product/${item.slug||item.id}`}>Відкрити товар</Link></Popup></CircleMarker>)}</MapContainer></div></section>
}

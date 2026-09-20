import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { deals } from '../data/mock'
import { money } from '../lib/format'

export default function DealMap(){
  const points=deals.filter(d=>d.lat&&d.lng)
  return <section className="map-page"><div className="map-panel"><span>📍 DealMap</span><h1>Вигода поруч</h1><p>Акції й реальні падіння цін у фізичних магазинах навколо тебе.</p><div className="chips"><button className="chip active">Усе</button><button className="chip">&gt;20%</button><button className="chip">Продукти</button><button className="chip">Техніка</button></div><div className="map-list">{points.slice(0,4).map(d=><div className="map-row" key={d.id}><div><b>{d.title}</b><span>{d.store} · {d.distance}</span></div><strong>{money(d.price)}</strong></div>)}</div></div><div className="map-canvas"><MapContainer center={[50.3195,30.298]} zoom={13} scrollWheelZoom style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{points.map(d=><CircleMarker key={d.id} center={[d.lat!,d.lng!]} radius={13} pathOptions={{color:'#101828',fillColor:'#b8ff39',fillOpacity:1,weight:3}}><Popup><b>{d.title}</b><br/>{d.store}<br/><strong>{money(d.price)}</strong></Popup></CircleMarker>)}</MapContainer></div></section>
}

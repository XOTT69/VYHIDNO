import { NavLink, Outlet } from 'react-router-dom'
import { BadgePercent, Heart, Home, MapPinned, Tags } from 'lucide-react'
import { Logo } from './Logo'

const nav = [
  {to:'/', label:'Головна', icon:Home},
  {to:'/deals', label:'Знижки', icon:BadgePercent},
  {to:'/map', label:'Карта', icon:MapPinned},
  {to:'/my-price', label:'Моя ціна', icon:Tags},
  {to:'/saved', label:'Моє', icon:Heart},
]

export default function Layout(){
  return <div className="app-shell">
    <header className="topbar"><NavLink to="/" aria-label="VYHIDNO — головна"><Logo/></NavLink><div className="top-actions"><NavLink className="ghost-btn" to="/my-price">Назвати свою ціну</NavLink><NavLink className="avatar" to="/saved" aria-label="Мої товари">М</NavLink></div></header>
    <main><Outlet/></main>
    <nav className="bottom-nav">{nav.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/' } className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={21}/><span>{label}</span></NavLink>)}</nav>
  </div>
}

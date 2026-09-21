import { NavLink, Outlet } from 'react-router-dom'
import { BadgePercent, Heart, Home, MapPinned, Search, Tags } from 'lucide-react'
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
    <header className="site-header"><div className="topbar"><NavLink to="/" aria-label="VYHIDNO — головна"><Logo/></NavLink><nav className="desktop-nav" aria-label="Основна навігація"><NavLink to="/deals">Знижки</NavLink><NavLink to="/map">Поруч</NavLink><NavLink to="/my-price">Моя ціна</NavLink></nav><div className="top-actions"><NavLink className="search-shortcut" to="/search" aria-label="Пошук"><Search size={19}/><span>Знайти товар</span></NavLink><NavLink className="saved-shortcut" to="/saved" aria-label="Збережені товари"><Heart size={19}/></NavLink></div></div></header>
    <main><Outlet/></main>
    <nav className="bottom-nav">{nav.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==='/' } className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={21}/><span>{label}</span></NavLink>)}</nav>
  </div>
}

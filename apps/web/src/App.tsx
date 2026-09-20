import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Deals from './pages/Deals'
import DealMap from './pages/DealMap'
import MyPrice from './pages/MyPrice'
import Product from './pages/Product'
import Search from './pages/Search'
import Saved from './pages/Saved'

export default function App(){
 return <Routes><Route element={<Layout/>}><Route path="/" element={<Home/>}/><Route path="/deals" element={<Deals/>}/><Route path="/map" element={<DealMap/>}/><Route path="/my-price" element={<MyPrice/>}/><Route path="/saved" element={<Saved/>}/><Route path="/search" element={<Search/>}/><Route path="/product/:id" element={<Product/>}/></Route></Routes>
}

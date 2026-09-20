import { Bell, Trash2 } from 'lucide-react'
import { product } from '../data/mock'
import { money } from '../lib/format'

export default function Saved(){
 return <section className="container page narrow"><div className="page-title"><span>♡ Моє</span><h1>Стежимо за цінами</h1><p>Тут зберігаються товари, кошики й активні сповіщення.</p></div><div className="watch-card"><div className="deal-thumb">🐶</div><div className="watch-main"><b>{product.name}</b><span>Зараз {money(product.price)}</span><div className="target"><Bell size={16}/> Повідомити при ≤ <strong>2 700 грн</strong></div></div><button className="icon-btn"><Trash2 size={18}/></button></div></section>
}

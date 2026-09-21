import { Coffee, Headphones, Home, PackageOpen, PawPrint, ShoppingBasket } from 'lucide-react'

type Props = { image?: string; category?: string; name: string; className?: string }

export default function ProductVisual({image,category,name,className=''}:Props){
  const Icon = category === 'Тварини' ? PawPrint
    : category === 'Продукти' ? (name.toLowerCase().includes('кава') ? Coffee : ShoppingBasket)
    : category === 'Дім' ? Home
    : category === 'Техніка' ? Headphones
    : PackageOpen
  return <div className={`product-visual ${className}`.trim()} data-category={category || 'Інше'}>
    {image ? <img src={image} alt={name} loading="lazy"/> : <><Icon aria-hidden="true"/><span>{category || 'Знахідка'}</span></>}
  </div>
}

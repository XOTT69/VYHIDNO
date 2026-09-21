export default function PriceChart({values}:{values:number[]}){
  if (!values.length) return <div className="empty-state compact">Історія ціни з’явиться після першого оновлення.</div>
  const w=700,h=220,p=18,min=Math.min(...values),max=Math.max(...values),range=max-min||1
  const denominator=Math.max(values.length-1,1)
  const pts=values.map((v,i)=>`${p+i*(w-2*p)/denominator},${h-p-(v-min)*(h-2*p)/range}`).join(' ')
  return <div className="chart-wrap"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Історія ціни"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".18"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`${p},${h-p} ${pts} ${w-p},${h-p}`} fill="url(#fill)"/><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/></svg><div className="chart-labels"><span>{max.toLocaleString('uk-UA')} грн</span><span>{min.toLocaleString('uk-UA')} грн</span></div></div>
}

export const money = (value:number) => new Intl.NumberFormat('uk-UA', { style:'currency', currency:'UAH', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value)
export const pctDrop = (oldPrice:number, price:number) => Math.round((1 - price / oldPrice) * 100)

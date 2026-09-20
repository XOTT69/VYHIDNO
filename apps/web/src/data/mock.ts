export type Deal = {
  id: string
  title: string
  subtitle: string
  price: number
  oldPrice: number
  store: string
  category: string
  distance?: string
  score: number
  badge?: string
  lat?: number
  lng?: number
}

export const deals: Deal[] = [
  { id:'monge-15', title:'Monge Puppy & Junior 15 кг', subtitle:'Duck & Rice', price:2690, oldPrice:3340, store:'Petslike', category:'Тварини', score:94, badge:'Мінімум 90 днів', lat:50.3202, lng:30.2971, distance:'1,8 км' },
  { id:'airpods-pro', title:'Apple AirPods Pro', subtitle:'USB‑C', price:6899, oldPrice:8499, store:'Foxtrot', category:'Техніка', score:91, badge:'−19% за 3 дні', lat:50.3188, lng:30.2912, distance:'2,4 км' },
  { id:'lavazza', title:'Lavazza Crema e Aroma 1 кг', subtitle:'Кава в зернах', price:499, oldPrice:729, store:'VARUS', category:'Продукти', score:96, badge:'−32%', lat:50.323, lng:30.305, distance:'900 м' },
  { id:'robot', title:'Roborock Q8 Max', subtitle:'Робот-пилосос', price:13799, oldPrice:15999, store:'COMFY', category:'Дім', score:88, badge:'Хороша ціна', lat:50.314, lng:30.288, distance:'3,1 км' },
  { id:'cola', title:'Coca‑Cola 2 л', subtitle:'Original Taste', price:49.9, oldPrice:74.9, store:'NOVUS', category:'Продукти', score:92, badge:'−33%', lat:50.327, lng:30.298, distance:'1,2 км' },
  { id:'persil', title:'Persil Deep Clean 4,5 кг', subtitle:'Пральний порошок', price:399, oldPrice:589, store:'АТБ', category:'Дім', score:90, badge:'−32%', lat:50.31, lng:30.31, distance:'2,7 км' }
]

export const product = {
  id: 'monge-15',
  name: 'Monge Puppy & Junior 15 кг',
  variant: 'Duck & Rice',
  price: 2690,
  avg30: 3118,
  low180: 2649,
  score: 94,
  verdict: 'Дуже вигідно',
  history: [3190,3190,3099,3140,2999,3025,2899,2840,2799,2690],
  offers: [
    { store:'Petslike', price:2690, delivery:'безкоштовно', rating:4.9 },
    { store:'ZooComplex', price:2749, delivery:'від 80 грн', rating:4.8 },
    { store:'MasterZoo', price:2899, delivery:'безкоштовно', rating:4.9 },
    { store:'Prom продавець', price:2925, delivery:'від 99 грн', rating:4.7 },
  ]
}

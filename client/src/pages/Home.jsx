import {useEffect,useState} from 'react';import api,{err,R} from '../api';import {useApp} from '../store';import Plate from './Plate';
const CATS=['Coffee','Breakfast','Burgers','Pizza','Desserts','Beverages'];
function Modal({item,onClose}){
  const {add}=useApp(),[size,setSize]=useState(item.sizes[0]?.name||''),[ex,setEx]=useState([]),[qty,setQty]=useState(1),[note,setNote]=useState('');
  const unit=item.price+(item.sizes.find(s=>s.name===size)?.delta||0)+ex.reduce((a,n)=>a+(item.extras.find(e=>e.name===n)?.price||0),0);
  return <div className="scrim" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={item.name} onClick={e=>e.stopPropagation()}>
    <div className="ph"><Plate item={item}/></div><div className="mb"><h3>{item.name}</h3><p className="mute">{item.description}</p>
    {item.allergens?.length>0&&<p className="mute">Allergens: {item.allergens.join(', ')}</p>}
    {item.sizes.length>0&&<fieldset><legend>Size</legend>{item.sizes.map(s=><label key={s.name} className="pill"><input type="radio" checked={size===s.name} onChange={()=>setSize(s.name)}/>{s.name}{s.delta>0&&` +${R(s.delta)}`}</label>)}</fieldset>}
    {item.extras.length>0&&<fieldset><legend>Extras</legend>{item.extras.map(x=><label key={x.name} className="pill"><input type="checkbox" checked={ex.includes(x.name)} onChange={e=>setEx(e.target.checked?[...ex,x.name]:ex.filter(n=>n!==x.name))}/>{x.name}{x.price>0&&` +${R(x.price)}`}</label>)}</fieldset>}
    <label>Special instructions<textarea rows="2" maxLength="140" value={note} onChange={e=>setNote(e.target.value)}/></label>
    <div className="row2"><div className="qty"><button aria-label="Fewer" onClick={()=>setQty(Math.max(1,qty-1))}>−</button><span>{qty}</span><button aria-label="More" onClick={()=>setQty(Math.min(20,qty+1))}>+</button></div>
    <button className="btn" disabled={!item.available} onClick={()=>{add({menuItem:item._id,name:item.name,size,extras:ex,note,qty,unit});onClose()}}>{item.available?`Add · ${R(unit*qty)}`:'Unavailable'}</button></div>
    <button className="chip" onClick={onClose}>Close</button></div></div></div>;
}
export default function Home(){
  const [items,setItems]=useState(null),[cat,setCat]=useState(''),[q,setQ]=useState(''),[veg,setVeg]=useState(false),[sort,setSort]=useState(''),[sel,setSel]=useState(null),[error,setError]=useState('');
  useEffect(()=>{setItems(null);setError('');const t=setTimeout(()=>api.get('/menu',{params:{category:cat||undefined,search:q||undefined,veg:veg||undefined,sort:sort||undefined}}).then(r=>setItems(r.data.data)).catch(e=>setError(err(e))),250);return()=>clearTimeout(t)},[cat,q,veg,sort]);
  return <>
    <div className="wrap hero"><div><h1>Slow mornings,<br/><em>fired</em> dinners.</h1><p className="mute big">A neighbourhood café and wood-oven kitchen. Order for takeaway, delivery or dine-in, or book a table.</p></div>
      <div className="plates" aria-hidden="true"><span/><span/></div></div>
    <section className="wrap sec"><h2>The menu</h2>
      <div className="tools" role="group" aria-label="Categories">{['',...CATS].map(c=><button key={c} className="chip" aria-pressed={cat===c} onClick={()=>setCat(c)}>{c||'All'}</button>)}</div>
      <div className="tools"><input type="search" placeholder="Search dishes" aria-label="Search dishes" value={q} onChange={e=>setQ(e.target.value)}/>
        <select aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="">Most popular</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
        <button className="chip" aria-pressed={veg} onClick={()=>setVeg(!veg)}>Vegetarian only</button></div>
      {error&&<p className="err" role="alert">{error}</p>}
      <div className="grid">{items===null&&!error?Array.from({length:6},(_,i)=><div key={i} className="skel"/>):items?.map(m=>
        <button key={m._id} className="it" onClick={()=>setSel(m)} aria-label={`Customise ${m.name}`}><div className="ph"><Plate item={m}/></div>
          <h3><span>{m.name}</span><span>{R(m.price)}</span></h3><p className="mute"><span className={`dot ${m.veg?'':'nv'}`}/>{m.description}{!m.available&&' (Unavailable)'}</p></button>)}</div>
      {items&&!items.length&&<p className="empty">No dishes match. Try another search or clear the filters.</p>}</section>
    {sel&&<Modal item={sel} onClose={()=>setSel(null)}/>}</>;
}

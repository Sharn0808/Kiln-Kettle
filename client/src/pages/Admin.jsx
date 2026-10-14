import {useEffect,useState,useCallback} from 'react';import api,{err,R} from '../api';import {label} from './Orders';
const NEXT={pending:['confirmed','cancelled'],confirmed:['preparing','cancelled'],preparing:['ready','out_for_delivery'],ready:['completed'],out_for_delivery:['delivered']};
const RNEXT={pending:['confirmed','rejected','cancelled'],confirmed:['cancelled','completed','no_show']};
const opts=o=>(NEXT[o.status]||[]).filter(s=>o.orderType==='delivery'?!['ready','completed'].includes(s):s!=='out_for_delivery'&&s!=='delivered');
function Orders({say}){const [l,setL]=useState([]),[st,setSt]=useState(''),[q,setQ]=useState('');
  const load=useCallback(()=>api.get('/admin/orders',{params:{status:st||undefined,search:q||undefined}}).then(r=>setL(r.data.data)).catch(x=>say(err(x))),[st,q]);useEffect(()=>{load()},[load]);
  const mv=async(id,status)=>{try{await api.patch(`/admin/orders/${id}/status`,{status});load()}catch(x){say(err(x))}};
  return <><div className="tools"><input placeholder="Search order number" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search orders"/><select value={st} onChange={e=>setSt(e.target.value)} aria-label="Status"><option value="">All statuses</option>{Object.keys(NEXT).concat(['delivered','completed','cancelled']).map(s=><option key={s} value={s}>{label(s)}</option>)}</select></div>
    {!l.length&&<p className="empty">No orders match.</p>}{l.map(o=><div className="oc" key={o._id}><div className="row2"><b>{o.number} · {o.customer.name}</b><span>{R(o.totals.total)}</span></div><small className="mute">{new Date(o.createdAt).toLocaleString()} · {o.orderType} · {o.payment.method} {o.payment.status} · {label(o.status)}</small>
      <div>{o.items.map(i=>`${i.qty}× ${i.name}`).join(', ')}</div><div className="tools">{opts(o).map(s=><button key={s} className="chip" onClick={()=>mv(o._id,s)}>Mark {label(s).toLowerCase()}</button>)}</div></div>)}</>}
function Resv({say}){const [l,setL]=useState([]),[d,setD]=useState('');
  const load=useCallback(()=>api.get('/admin/reservations',{params:{date:d||undefined}}).then(r=>setL(r.data.data)).catch(x=>say(err(x))),[d]);useEffect(()=>{load()},[load]);
  const mv=async(id,status)=>{try{await api.patch(`/admin/reservations/${id}/status`,{status});load()}catch(x){say(err(x))}};
  return <><div className="tools"><input type="date" value={d} onChange={e=>setD(e.target.value)} aria-label="Date"/></div>{!l.length&&<p className="empty">No reservations.</p>}
    {l.map(r=><div className="rc" key={r._id}><div><b>{r.date} {r.time} · {r.name}</b><br/><small className="mute">{r.guests} guests · table {r.table+1} · {r.phone} · {label(r.status)}</small></div><div className="tools">{(RNEXT[r.status]||[]).map(s=><button key={s} className="chip" onClick={()=>mv(r._id,s)}>{label(s)}</button>)}</div></div>)}</>}
function Menu({say}){const [l,setL]=useState([]),[f,setF]=useState({name:'',category:'Coffee',price:'',description:'',veg:true,image:''});
  const load=()=>api.get('/menu').then(r=>setL(r.data.data)).catch(x=>say(err(x)));useEffect(()=>{load()},[]);
  const tog=async m=>{try{await api.put(`/menu/${m._id}`,{available:!m.available});load()}catch(x){say(err(x))}};
  const del=async m=>{if(confirm(`Archive ${m.name}?`))try{await api.delete(`/menu/${m._id}`);load()}catch(x){say(err(x))}};
  const add=async e=>{e.preventDefault();try{await api.post('/menu',{...f,price:+f.price,image:f.image||undefined});setF({...f,name:'',price:'',description:'',image:''});load()}catch(x){say(err(x))}};
  const s=k=>e=>setF({...f,[k]:e.target.value});
  return <><form className="f" onSubmit={add} noValidate><div className="row"><label>Name<input value={f.name} onChange={s('name')}/></label><label>Price (₹)<input inputMode="numeric" value={f.price} onChange={s('price')}/></label></div>
    <div className="row"><label>Category<select value={f.category} onChange={s('category')}>{['Coffee','Breakfast','Burgers','Pizza','Desserts','Beverages'].map(c=><option key={c}>{c}</option>)}</select></label><label>Image URL (optional)<input value={f.image} onChange={s('image')}/></label></div>
    <label>Description<input value={f.description} onChange={s('description')}/></label><label className="pill"><input type="checkbox" checked={f.veg} onChange={e=>setF({...f,veg:e.target.checked})}/>Vegetarian</label><button className="btn">Add dish</button></form>
    {l.map(m=><div className="rc" key={m._id}><div><b>{m.name}</b> · {R(m.price)}<br/><small className="mute">{m.category} · {m.available?'Available':'Unavailable'}</small></div><div className="tools"><button className="chip" onClick={()=>tog(m)}>{m.available?'Mark unavailable':'Mark available'}</button><button className="chip" onClick={()=>del(m)}>Archive</button></div></div>)}</>}
function Msgs({say}){const [l,setL]=useState([]);useEffect(()=>{api.get('/admin/messages').then(r=>setL(r.data.data)).catch(x=>say(err(x)))},[]);
  return <>{!l.length&&<p className="empty">No messages yet.</p>}{l.map(m=><div className="oc" key={m._id}><b>{m.name}</b> · <a href={`mailto:${m.email}`}>{m.email}</a><br/><small className="mute">{new Date(m.createdAt).toLocaleString()}</small><p>{m.message}</p></div>)}</>}
function Settings({say}){const [f,setF]=useState(null),[ok,setOk]=useState(false);
  useEffect(()=>{api.get('/settings').then(r=>setF(r.data.data)).catch(x=>say(err(x)))},[]);
  if(!f)return <div className="skel" style={{height:160}}/>;
  const t=k=>e=>setF({...f,[k]:e.target.value}),n=k=>e=>setF({...f,[k]:e.target.value===''?'':+e.target.value}),pm=m=>e=>setF({...f,paymentMethods:e.target.checked?[...new Set([...f.paymentMethods,m])]:f.paymentMethods.filter(x=>x!==m)});
  const save=async ev=>{ev.preventDefault();setOk(false);say('');const b={name:f.name,phone:f.phone||'',address:f.address||'',mapEmbedUrl:f.mapEmbedUrl||'',openTime:f.openTime,closeTime:f.closeTime,taxPercent:+f.taxPercent,deliveryCharge:+f.deliveryCharge,freeDeliveryAbove:+f.freeDeliveryAbove,reservationMinutes:+f.reservationMinutes,cancelHoursBefore:+f.cancelHoursBefore,autoConfirm:!!f.autoConfirm,paymentMethods:f.paymentMethods};
    if(f.email)b.email=f.email;try{await api.put('/admin/settings',b);setOk(true)}catch(x){say(err(x))}};
  return <form className="f" onSubmit={save} noValidate><div className="row"><label>Restaurant name<input value={f.name||''} onChange={t('name')}/></label><label>Phone<input value={f.phone||''} onChange={t('phone')}/></label></div>
    <div className="row"><label>Email<input type="email" value={f.email||''} onChange={t('email')}/></label><label>Address<input value={f.address||''} onChange={t('address')}/></label></div>
    <label>Google Maps embed link (starts with https://www.google.com/maps/embed)<input value={f.mapEmbedUrl||''} onChange={t('mapEmbedUrl')}/></label>
    <div className="row"><label>Opens<input type="time" value={f.openTime} onChange={t('openTime')}/></label><label>Closes<input type="time" value={f.closeTime} onChange={t('closeTime')}/></label></div>
    <div className="row"><label>GST %<input inputMode="decimal" value={f.taxPercent} onChange={n('taxPercent')}/></label><label>Delivery charge (₹)<input inputMode="numeric" value={f.deliveryCharge} onChange={n('deliveryCharge')}/></label></div>
    <div className="row"><label>Free delivery above (₹)<input inputMode="numeric" value={f.freeDeliveryAbove} onChange={n('freeDeliveryAbove')}/></label><label>Booking length (minutes)<input inputMode="numeric" value={f.reservationMinutes} onChange={n('reservationMinutes')}/></label></div>
    <label>Cancel allowed until (hours before)<input inputMode="numeric" value={f.cancelHoursBefore} onChange={n('cancelHoursBefore')}/></label>
    <fieldset><legend>Payment methods</legend><label className="pill"><input type="checkbox" checked={f.paymentMethods.includes('cod')} onChange={pm('cod')}/>Pay on pickup / delivery</label><label className="pill"><input type="checkbox" checked={f.paymentMethods.includes('razorpay')} onChange={pm('razorpay')}/>Razorpay (needs keys in server .env)</label></fieldset>
    <label className="pill"><input type="checkbox" checked={!!f.autoConfirm} onChange={e=>setF({...f,autoConfirm:e.target.checked})}/>Confirm reservations automatically</label>
    {ok&&<p className="ok" role="status">Settings saved. Reload other pages to see them.</p>}<button className="btn">Save settings</button></form>}
export default function Admin(){
  const [tab,setTab]=useState('orders'),[s,setS]=useState(null),[e,setE]=useState('');
  useEffect(()=>{api.get('/admin/stats').then(r=>setS(r.data.data)).catch(x=>setE(err(x)))},[tab]);
  return <div className="wrap sec"><h2>Dashboard</h2>{s&&<div className="stats"><div><b>{s.totalOrders}</b>Orders</div><div><b>{s.pendingOrders}</b>Pending</div><div><b>{R(s.revenue)}</b>Revenue (completed)</div><div><b>{s.activeReservations}</b>Upcoming bookings</div></div>}
    {s?.popular?.length>0&&<p className="mute">Popular: {s.popular.map(p=>`${p._id} (${p.qty})`).join(', ')}</p>}
    <div className="tools">{['orders','reservations','menu','messages','settings'].map(t=><button key={t} className="chip" aria-pressed={tab===t} onClick={()=>{setTab(t);setE('')}}>{label(t)}</button>)}</div>
    {e&&<p className="err" role="alert">{e}</p>}{tab==='orders'?<Orders say={setE}/>:tab==='reservations'?<Resv say={setE}/>:tab==='menu'?<Menu say={setE}/>:tab==='messages'?<Msgs say={setE}/>:<Settings say={setE}/>}</div>;
}

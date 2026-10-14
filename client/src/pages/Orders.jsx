import {useEffect,useState} from 'react';import api,{err,R} from '../api';
const FLOW=t=>t==='delivery'?['pending','confirmed','preparing','out_for_delivery','delivered']:['pending','confirmed','preparing','ready','completed'];
export const label=s=>s.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
export default function Orders(){
  const [o,setO]=useState(null),[e,setE]=useState('');
  useEffect(()=>{api.get('/orders/my-orders').then(r=>setO(r.data.data)).catch(x=>setE(err(x)));const t=setInterval(()=>api.get('/orders/my-orders').then(r=>setO(r.data.data)).catch(()=>{}),20000);return()=>clearInterval(t)},[]);
  return <div className="wrap sec narrow"><h2>My orders</h2>{e&&<p className="err" role="alert">{e}</p>}{o===null&&!e&&<div className="skel" style={{height:120}}/>}
    {o&&!o.length&&<p className="empty">No orders yet. Your orders and their progress will appear here.</p>}
    {o?.map(x=><div className="oc" key={x._id}><div className="row2"><b>{x.number}</b><span>{R(x.totals.total)}</span></div>
      <small className="mute">{new Date(x.createdAt).toLocaleString()} · {x.orderType} · payment {x.payment.status}</small>
      {x.status==='cancelled'?<p className="err">Cancelled</p>:<div className="stp">{FLOW(x.orderType).map((s,i,a)=><span key={s} className={a.indexOf(x.status)>=i?'on':''}>{label(s)}</span>)}</div>}
      {x.items.map((i,k)=><div key={k}>{i.qty}× {i.name} <small className="mute">{[i.size,...i.extras].filter(Boolean).join(', ')}</small></div>)}</div>)}</div>;
}

import {useState} from 'react';import {Link,useNavigate} from 'react-router-dom';import api,{err,R} from '../api';import {useApp} from '../store';
const loadRzp=()=>new Promise((ok,no)=>{if(window.Razorpay)return ok();const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=ok;s.onerror=()=>no(new Error('Could not load Razorpay'));document.body.appendChild(s)});
export default function Checkout(){
  const {cart,setQty,clear,user,settings:st}=useApp(),nav=useNavigate();
  const [type,setType]=useState('takeaway'),[code,setCode]=useState(''),[cp,setCp]=useState(null),[cpe,setCpe]=useState(''),[pay,setPay]=useState('cod'),[e,setE]=useState(''),[busy,setBusy]=useState(false);
  const [c,setC]=useState({name:user?.name||'',phone:'',email:user?.email||'',address:''}),[notes,setNotes]=useState('');
  const sub=cart.reduce((a,l)=>a+l.unit*l.qty,0),disc=cp?cp.discount:0,net=sub-disc,del=type==='delivery'&&net<st.freeDeliveryAbove&&sub>0?st.deliveryCharge:0,tax=Math.round(net*st.taxPercent/100),total=net+del+tax;
  if(!cart.length)return <div className="wrap sec"><h2>Your cart is empty</h2><p className="mute">Pick something from the menu and it will wait here, even if you refresh.</p><Link className="btn" to="/">Browse menu</Link></div>;
  const apply=async()=>{setCpe('');try{const r=await api.post('/coupons/validate',{code,subtotal:sub});setCp(r.data.data)}catch(x){setCp(null);setCpe(err(x))}};
  const place=async ev=>{ev.preventDefault();setE('');setBusy(true);
    try{const r=await api.post('/orders',{items:cart.map(l=>({menuItem:l.menuItem,qty:l.qty,size:l.size||undefined,extras:l.extras,note:l.note||undefined})),orderType:type,coupon:cp?cp.code:undefined,paymentMethod:pay,notes:notes||undefined,customer:{name:c.name,phone:c.phone,email:c.email,address:type==='delivery'?c.address:undefined}});
      const {order,razorpay:rz}=r.data.data;
      if(rz){await loadRzp();new window.Razorpay({key:rz.keyId,amount:rz.amount,currency:'INR',order_id:rz.orderId,name:'Kiln & Kettle',handler:async res=>{try{await api.post(`/orders/${order._id}/verify-payment`,res);clear();nav('/orders')}catch(x){setE(err(x))}},modal:{ondismiss:()=>{setE('Payment was not completed. Your order is saved as unpaid in My orders.');clear()}}}).open()}
      else{clear();nav('/orders')}
    }catch(x){setE(err(x))}finally{setBusy(false)}};
  const f=k=>x=>setC({...c,[k]:x.target.value});
  return <div className="wrap sec two"><div><h2>Your cart</h2>{cart.map(l=><div className="ln" key={l.key}><div><b>{l.name}</b><small className="mute">{[l.size,...l.extras].filter(Boolean).join(', ')}{l.note&&` · “${l.note}”`}</small>
      <div className="qty"><button aria-label="Decrease" onClick={()=>setQty(l.key,l.qty-1)}>−</button><span>{l.qty}</span><button aria-label="Increase" onClick={()=>setQty(l.key,l.qty+1)}>+</button></div></div><div>{R(l.unit*l.qty)}</div></div>)}
    <div className="f"><label>Coupon code<div className="row2"><input value={code} onChange={x=>setCode(x.target.value)}/><button type="button" className="btn alt" onClick={apply}>Apply</button></div></label>{cpe&&<p className="err" role="alert">{cpe}</p>}{cp&&<p>{cp.code} applied: −{R(cp.discount)}</p>}</div>
    <div className="tot"><div><span>Subtotal</span><span>{R(sub)}</span></div>{disc>0&&<div><span>Discount</span><span>−{R(disc)}</span></div>}<div><span>Delivery</span><span>{type==='delivery'?(del?R(del):'Free'):'—'}</span></div><div><span>GST {st.taxPercent}%</span><span>{R(tax)}</span></div><div className="g"><span>Total</span><span>{R(total)}</span></div></div>
    <small className="mute">Final prices are confirmed by the restaurant's server when you place the order.</small></div>
    <div><h2>Checkout</h2>{!user?<p>Please <Link to="/login" state={{from:'/checkout'}}>sign in</Link> or <Link to="/register">create an account</Link> to place your order. Your cart will be kept.</p>:
    <form className="f" onSubmit={place} noValidate><label>Order type<select value={type} onChange={x=>setType(x.target.value)}><option value="takeaway">Takeaway</option><option value="delivery">Delivery</option><option value="dine-in">Dine-in</option></select></label>
      <label>Name<input value={c.name} onChange={f('name')}/></label><div className="row"><label>Phone<input inputMode="numeric" value={c.phone} onChange={f('phone')}/></label><label>Email<input type="email" value={c.email} onChange={f('email')}/></label></div>
      {type==='delivery'&&<label>Delivery address<textarea rows="2" value={c.address} onChange={f('address')}/></label>}
      <label>Payment<select value={pay} onChange={x=>setPay(x.target.value)}>{st.paymentMethods.includes('cod')&&<option value="cod">Pay on pickup / delivery</option>}{st.paymentMethods.includes('razorpay')&&<option value="razorpay">Pay online (Razorpay)</option>}</select></label>
      <label>Order notes<textarea rows="2" value={notes} onChange={x=>setNotes(x.target.value)}/></label>{e&&<p className="err" role="alert">{e}</p>}<button className="btn" disabled={busy}>{busy?'Placing order…':`Place order · ${R(total)}`}</button></form>}</div></div>;
}

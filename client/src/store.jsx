import {createContext,useContext,useEffect,useState} from 'react';
import api from './api';
const Ctx=createContext();export const useApp=()=>useContext(Ctx);
export function Provider({children}){
  const [user,setUser]=useState(null),[ready,setReady]=useState(false),[settings,setSettings]=useState({taxPercent:5,deliveryCharge:40,freeDeliveryAbove:600,paymentMethods:['cod']});
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('kk_cart'))||[]}catch{return[]}});
  useEffect(()=>{localStorage.setItem('kk_cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{
    api.get('/settings').then(r=>setSettings(r.data.data)).catch(()=>{});
    if(!localStorage.getItem('kk_token'))return setReady(true);
    api.get('/auth/me').then(r=>setUser(r.data.data)).catch(()=>localStorage.removeItem('kk_token')).finally(()=>setReady(true));
  },[]);
  const login=d=>{localStorage.setItem('kk_token',d.token);setUser(d.user)};
  const logout=()=>{localStorage.removeItem('kk_token');setUser(null)};
  const add=l=>setCart(c=>{const key=JSON.stringify([l.menuItem,l.size,l.extras,l.note]),i=c.findIndex(x=>x.key===key);
    if(i>=0){const n=[...c];n[i]={...n[i],qty:Math.min(20,n[i].qty+l.qty)};return n}return[...c,{...l,key}]});
  const setQty=(key,q)=>setCart(c=>q<1?c.filter(x=>x.key!==key):c.map(x=>x.key===key?{...x,qty:Math.min(20,q)}:x));
  const clear=()=>setCart([]);
  return <Ctx.Provider value={{user,ready,settings,cart,login,logout,add,setQty,clear}}>{children}</Ctx.Provider>;
}

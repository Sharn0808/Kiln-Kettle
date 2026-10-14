import {useState} from 'react';import {Link,useNavigate,useLocation} from 'react-router-dom';import api,{err} from '../api';import {useApp} from '../store';
export default function Auth({register}){
  const {login}=useApp(),nav=useNavigate(),loc=useLocation(),[f,setF]=useState({name:'',email:'',password:''}),[e,setE]=useState(''),[busy,setBusy]=useState(false);
  const set=k=>x=>setF({...f,[k]:x.target.value});
  const go=async ev=>{ev.preventDefault();setBusy(true);setE('');
    try{const r=await api.post(register?'/auth/register':'/auth/login',register?f:{email:f.email,password:f.password});login(r.data.data);nav(loc.state?.from||'/',{replace:true})}catch(x){setE(err(x))}finally{setBusy(false)}};
  return <div className="wrap sec narrow"><h2>{register?'Create account':'Sign in'}</h2><form className="f" onSubmit={go} noValidate>
    {register&&<label>Name<input value={f.name} onChange={set('name')} autoComplete="name"/></label>}
    <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email"/></label>
    <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={register?'new-password':'current-password'}/>{register&&<small className="mute">At least 8 characters.</small>}</label>
    {e&&<p className="err" role="alert">{e}</p>}<button className="btn" disabled={busy}>{busy?'Please wait…':register?'Create account':'Sign in'}</button></form>
    <p className="mute">{register?<>Have an account? <Link to="/login">Sign in</Link></>:<>New here? <Link to="/register">Create an account</Link></>}</p></div>;
}

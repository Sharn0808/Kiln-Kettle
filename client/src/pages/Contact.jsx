import {useState} from 'react';import api,{err} from '../api';import {useApp} from '../store';
export default function Contact(){
  const {settings:s}=useApp(),[f,setF]=useState({name:'',email:'',message:''}),[e,setE]=useState(''),[ok,setOk]=useState(false),[busy,setBusy]=useState(false);
  const k=n=>x=>setF({...f,[n]:x.target.value});
  const send=async ev=>{ev.preventDefault();setE('');setOk(false);setBusy(true);try{await api.post('/contact',f);setOk(true);setF({name:'',email:'',message:''})}catch(x){setE(err(x))}finally{setBusy(false)}};
  const map=s.mapEmbedUrl&&s.mapEmbedUrl.startsWith('https://www.google.com/maps/embed')?s.mapEmbedUrl:null;
  return <div className="wrap sec two"><div><h2>Visit us</h2><p className="mute">Sample details. The owner can change them in Admin → Settings.</p>
    <p>{s.address||'12 Sample Lane, Your City'}<br/>{s.phone||'+91 00000 00000'}<br/>{s.email||'hello@kilnandkettle.example'}</p>
    <p><b>Hours</b><br/>Daily {s.openTime||'08:00'} to {s.closeTime||'22:00'}</p>
    {map?<iframe title="Map" src={map} loading="lazy" style={{border:0,width:'100%',height:260,borderRadius:18}}/>:<p className="mute">Map not configured yet. Add a Google Maps embed link in Admin → Settings.</p>}</div>
    <div><h2>Write to us</h2><form className="f" onSubmit={send} noValidate><label>Name<input value={f.name} onChange={k('name')}/></label><label>Email<input type="email" value={f.email} onChange={k('email')}/></label>
    <label>Message<textarea rows="5" value={f.message} onChange={k('message')}/></label>{e&&<p className="err" role="alert">{e}</p>}{ok&&<p className="ok" role="status">Thanks, your message has been received.</p>}<button className="btn" disabled={busy}>{busy?'Sending…':'Send message'}</button></form></div></div>;
}

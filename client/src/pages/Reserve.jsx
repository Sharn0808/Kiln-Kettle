import {useEffect,useState} from 'react';import api,{err} from '../api';import {useApp} from '../store';
const slots=Array.from({length:28},(_,i)=>{const m=480+i*30;return `${String(m/60|0).padStart(2,'0')}:${m%60?'30':'00'}`});
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export default function Reserve(){
  const {user,settings:st}=useApp(),[f,setF]=useState({name:user.name,phone:'',email:user.email,date:'',time:'19:00',guests:2,notes:''}),[e,setE]=useState(''),[ok,setOk]=useState(''),[list,setList]=useState(null),[busy,setBusy]=useState(false);
  const load=()=>api.get('/reservations/my-reservations').then(r=>setList(r.data.data)).catch(x=>setE(err(x)));useEffect(()=>{load()},[]);
  const s=k=>x=>setF({...f,[k]:x.target.value});
  const book=async ev=>{ev.preventDefault();setE('');setOk('');setBusy(true);
    try{if(!f.date)throw {response:{data:{message:'Choose a date'}}};const r=await api.post('/reservations',{...f,guests:+f.guests,notes:f.notes||undefined});setOk(`Booked for ${r.data.data.date} at ${r.data.data.time}. Status: ${r.data.data.status}.`);load()}catch(x){setE(err(x))}finally{setBusy(false)}};
  const cancel=async id=>{try{await api.patch(`/reservations/${id}/cancel`);load()}catch(x){setE(err(x))}};
  return <div className="wrap sec two"><div><h2>Reserve a table</h2><p className="mute">Open {st.openTime} to {st.closeTime}. Bookings run {st.reservationMinutes} minutes and can be cancelled up to {st.cancelHoursBefore} hours before.</p>
    <form className="f" onSubmit={book} noValidate><div className="row"><label>Name<input value={f.name} onChange={s('name')}/></label><label>Phone<input inputMode="numeric" value={f.phone} onChange={s('phone')}/></label></div>
    <label>Email<input type="email" value={f.email} onChange={s('email')}/></label><div className="row"><label>Date<input type="date" min={today()} value={f.date} onChange={s('date')}/></label><label>Time<select value={f.time} onChange={s('time')}>{slots.map(t=><option key={t}>{t}</option>)}</select></label></div>
    <label>Guests<select value={f.guests} onChange={s('guests')}>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><label>Special requests<textarea rows="2" value={f.notes} onChange={s('notes')}/></label>
    {e&&<p className="err" role="alert">{e}</p>}{ok&&<p className="ok" role="status">{ok}</p>}<button className="btn" disabled={busy}>{busy?'Booking…':'Book table'}</button></form></div>
    <div><h2>Your reservations</h2>{list&&!list.length&&<p className="empty">No reservations yet.</p>}{list?.map(r=><div className="rc" key={r._id}><div><b>{r.date}, {r.time}</b><br/><small className="mute">{r.guests} guest{r.guests>1?'s':''} · {r.status}</small></div>{['pending','confirmed'].includes(r.status)&&<button className="chip" onClick={()=>cancel(r._id)}>Cancel</button>}</div>)}</div></div>;
}

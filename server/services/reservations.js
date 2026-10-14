const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const startMs=(date,time,off)=>{const[y,mo,d]=date.split('-').map(Number),[h,mi]=time.split(':').map(Number);return Date.UTC(y,mo-1,d,h,mi)-off*60000};
function validateSlot(r,s,now=Date.now()){
  const e=[];
  if(startMs(r.date,r.time,s.utcOffsetMinutes)<now)e.push('That time has already passed');
  if(toMin(r.time)<toMin(s.openTime)||toMin(r.time)+s.reservationMinutes>toMin(s.closeTime))e.push(`Bookings are accepted between ${s.openTime} and ${s.closeTime}, and must end before closing`);
  if(r.guests>Math.max(...s.tables))e.push(`We seat up to ${Math.max(...s.tables)} guests per booking`);
  return e;
}
// existing: active reservations; returns table index or -1
function assignTable(existing,r,tables,dur){
  const busy=new Set(existing.filter(x=>x.date===r.date&&Math.abs(toMin(x.time)-toMin(r.time))<dur).map(x=>x.table));
  let best=-1;
  tables.forEach((cap,i)=>{if(cap>=r.guests&&!busy.has(i)&&(best<0||cap<tables[best]))best=i});
  return best;
}
const canCancel=(r,s,now=Date.now())=>startMs(r.date,r.time,s.utcOffsetMinutes)-now>=s.cancelHoursBefore*36e5;
const STATUS={pending:['confirmed','rejected','cancelled'],confirmed:['cancelled','completed','no_show'],rejected:[],cancelled:[],completed:[],no_show:[]};
module.exports={validateSlot,assignTable,canCancel,startMs,STATUS};

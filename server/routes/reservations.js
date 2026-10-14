const r=require('express').Router(),{z}=require('zod'),ApiError=require('../utils/ApiError'),{Reservation,getSettings}=require('../models'),{h,protect,adminOnly}=require('../middleware/auth');
const R=require('../services/reservations');
const body=z.object({name:z.string().trim().min(2),phone:z.string().regex(/^[6-9]\d{9}$/,'Enter a 10-digit mobile number'),email:z.string().email(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),guests:z.number().int().min(1).max(20),notes:z.string().max(300).optional()});
r.post('/reservations',protect,h(async(q,s)=>{
  const b=body.parse(q.body),st=await getSettings();
  const errs=R.validateSlot(b,st);if(errs.length)throw new ApiError(400,errs.join('. '));
  const existing=await Reservation.find({date:b.date,status:{$in:['pending','confirmed']}});
  const table=R.assignTable(existing,b,st.tables,st.reservationMinutes);
  if(table<0)throw new ApiError(409,'No table is free for that party size at that time. Please try another slot');
  const doc=await Reservation.create({...b,user:q.user._id,table,status:st.autoConfirm?'confirmed':'pending'}); // unique index also blocks same-slot races
  s.status(201).json({success:true,data:doc});
}));
r.get('/reservations/my-reservations',protect,h(async(q,s)=>s.json({success:true,data:await Reservation.find({user:q.user._id}).sort('-date -time')})));
r.patch('/reservations/:id/cancel',protect,h(async(q,s)=>{
  const x=await Reservation.findOne({_id:q.params.id,user:q.user._id});if(!x)throw new ApiError(404,'Reservation not found');
  const st=await getSettings();
  if(!['pending','confirmed'].includes(x.status))throw new ApiError(400,'This reservation can no longer be cancelled');
  if(!R.canCancel(x,st))throw new ApiError(400,`Reservations can only be cancelled ${st.cancelHoursBefore} hours or more before the booking`);
  x.status='cancelled';await x.save();s.json({success:true,data:x});
}));
r.get('/admin/reservations',protect,adminOnly,h(async(q,s)=>{const f={};if(typeof q.query.date==='string')f.date=q.query.date;if(typeof q.query.status==='string')f.status=q.query.status;s.json({success:true,data:await Reservation.find(f).sort('date time').limit(300)})}));
r.patch('/admin/reservations/:id/status',protect,adminOnly,h(async(q,s)=>{
  const {status}=z.object({status:z.enum(Object.keys(R.STATUS))}).parse(q.body);
  const x=await Reservation.findById(q.params.id);if(!x)throw new ApiError(404,'Reservation not found');
  if(!R.STATUS[x.status].includes(status))throw new ApiError(400,`A ${x.status} reservation cannot become ${status}`);
  x.status=status;await x.save();s.json({success:true,data:x});
}));
module.exports=r;

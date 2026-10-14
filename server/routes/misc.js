const r=require('express').Router(),{z}=require('zod'),rate=require('express-rate-limit'),ApiError=require('../utils/ApiError');
const {Coupon,ContactMessage,Settings,getSettings}=require('../models'),{h,protect,adminOnly}=require('../middleware/auth');
const slow=rate({windowMs:60*6e4,limit:10,standardHeaders:true,legacyHeaders:false,message:{success:false,message:'Too many messages. Try again later'}});
r.post('/coupons/validate',h(async(q,s)=>{
  const b=z.object({code:z.string().trim().max(30),subtotal:z.number().min(0)}).parse(q.body);
  const c=await Coupon.findOne({code:b.code.toUpperCase()});
  if(!c||!c.active||(c.expiresAt&&c.expiresAt<new Date()))throw new ApiError(400,'This coupon is not valid');
  if(b.subtotal<c.minSubtotal)throw new ApiError(400,`This coupon needs a subtotal of at least ₹${c.minSubtotal}`);
  s.json({success:true,data:{code:c.code,percent:c.percent,discount:Math.round(b.subtotal*c.percent/100)}});
}));
r.post('/contact',slow,h(async(q,s)=>{
  const b=z.object({name:z.string().trim().min(2).max(80),email:z.string().email(),message:z.string().trim().min(10).max(1000)}).parse(q.body);
  await ContactMessage.create(b);s.status(201).json({success:true,data:{received:true}});
}));
r.get('/admin/messages',protect,adminOnly,h(async(q,s)=>s.json({success:true,data:await ContactMessage.find().sort('-createdAt').limit(100)})));
r.get('/settings',h(async(q,s)=>{const {tables,...pub}=(await getSettings()).toObject();s.json({success:true,data:pub})}));
const upd=z.object({name:z.string(),logo:z.string(),phone:z.string(),email:z.string().email(),address:z.string(),mapEmbedUrl:z.string(),openTime:z.string().regex(/^\d\d:\d\d$/),closeTime:z.string().regex(/^\d\d:\d\d$/),taxPercent:z.number().min(0).max(50),deliveryCharge:z.number().min(0),freeDeliveryAbove:z.number().min(0),paymentMethods:z.array(z.enum(['cod','razorpay'])),tables:z.array(z.number().int().min(1)).min(1),reservationMinutes:z.number().min(30).max(240),cancelHoursBefore:z.number().min(0),autoConfirm:z.boolean()}).partial();
r.put('/admin/settings',protect,adminOnly,h(async(q,s)=>s.json({success:true,data:await Settings.findOneAndUpdate({key:'main'},upd.parse(q.body),{new:true,upsert:true})})));
module.exports=r;

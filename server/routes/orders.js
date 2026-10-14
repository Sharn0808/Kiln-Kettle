const r=require('express').Router(),{z}=require('zod'),ApiError=require('../utils/ApiError'),cfg=require('../config/env');
const {MenuItem,Order,Coupon,Reservation,getSettings}=require('../models'),{h,protect,adminOnly}=require('../middleware/auth');
const {price}=require('../services/pricing'),{canMove,NEXT}=require('../services/orderFlow'),pay=require('../services/payment');
const body=z.object({items:z.array(z.object({menuItem:z.string(),qty:z.number().int().min(1).max(20),size:z.string().optional(),extras:z.array(z.string()).optional(),note:z.string().max(140).optional()})).min(1).max(40),
 orderType:z.enum(['takeaway','delivery','dine-in']),coupon:z.string().trim().max(30).optional(),paymentMethod:z.enum(['cod','razorpay']),notes:z.string().max(300).optional(),
 customer:z.object({name:z.string().trim().min(2),phone:z.string().regex(/^[6-9]\d{9}$/,'Enter a 10-digit mobile number'),email:z.string().email(),address:z.string().trim().optional()})})
 .refine(b=>b.orderType!=='delivery'||(b.customer.address&&b.customer.address.length>=8),{message:'Delivery address is required',path:['customer','address']});
const num=()=>'KK-'+Date.now().toString(36).toUpperCase().slice(-5)+Math.random().toString(36).slice(2,4).toUpperCase();
r.post('/orders',protect,h(async(q,s)=>{
  const b=body.parse(q.body),st=await getSettings();
  if(!st.paymentMethods.includes(b.paymentMethod))throw new ApiError(400,'That payment method is not available');
  const menu=new Map((await MenuItem.find({_id:{$in:b.items.map(i=>i.menuItem)}})).map(m=>[String(m._id),m]));
  const coupon=b.coupon?await Coupon.findOne({code:b.coupon.toUpperCase()}):null;
  if(b.coupon&&!coupon)throw new ApiError(400,'This coupon is not valid');
  const {items,totals}=price(b.items,menu,st,b.orderType,coupon);
  const o=new Order({number:num(),user:q.user._id,items,totals,coupon:coupon&&coupon.code,orderType:b.orderType,customer:b.customer,notes:b.notes,payment:{method:b.paymentMethod}});
  let rzp=null;
  if(b.paymentMethod==='razorpay'){rzp=await pay.createRazorpayOrder(totals.total,o.number);o.payment.razorpayOrderId=rzp.id}
  await o.save();
  s.status(201).json({success:true,data:{order:o,razorpay:rzp&&{orderId:rzp.id,amount:rzp.amount,keyId:cfg.rzpId}}});
}));
r.post('/orders/:id/verify-payment',protect,h(async(q,s)=>{
  const b=z.object({razorpay_payment_id:z.string(),razorpay_signature:z.string()}).parse(q.body);
  const o=await Order.findOne({_id:q.params.id,user:q.user._id});if(!o||o.payment.method!=='razorpay')throw new ApiError(404,'Order not found');
  const ok=pay.verifySignature(o.payment.razorpayOrderId,b.razorpay_payment_id,b.razorpay_signature,cfg.rzpSecret);
  o.payment.status=ok?'paid':'failed';if(ok)o.payment.razorpayPaymentId=b.razorpay_payment_id;await o.save();
  if(!ok)throw new ApiError(400,'Payment could not be verified');
  s.json({success:true,data:o});
}));
r.get('/orders/my-orders',protect,h(async(q,s)=>s.json({success:true,data:await Order.find({user:q.user._id}).sort('-createdAt')})));
r.get('/orders/:id',protect,h(async(q,s)=>{
  const o=await Order.findById(q.params.id);
  if(!o||(String(o.user)!==String(q.user._id)&&q.user.role!=='admin'))throw new ApiError(404,'Order not found'); // 404 so ids can't be probed
  s.json({success:true,data:o});
}));
r.get('/admin/orders',protect,adminOnly,h(async(q,s)=>{
  const f={};const{status,from,to,search}=q.query;
  if(typeof status==='string')f.status=status;
  if(from||to)f.createdAt={...(from&&{$gte:new Date(from)}),...(to&&{$lte:new Date(to)})};
  if(typeof search==='string'&&search)f.number=new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').slice(0,20),'i');
  s.json({success:true,data:await Order.find(f).sort('-createdAt').limit(200)});
}));
r.patch('/admin/orders/:id/status',protect,adminOnly,h(async(q,s)=>{
  const {status}=z.object({status:z.enum(Object.keys(NEXT))}).parse(q.body);
  const o=await Order.findById(q.params.id);if(!o)throw new ApiError(404,'Order not found');
  if(!canMove(o.status,status,o.orderType))throw new ApiError(400,`An order that is ${o.status} cannot move to ${status}`);
  o.status=status;await o.save();s.json({success:true,data:o});
}));
r.get('/admin/stats',protect,adminOnly,h(async(q,s)=>{
  const done=['completed','delivered'];
  const [total,pending,rev,pop,active]=await Promise.all([Order.countDocuments(),Order.countDocuments({status:'pending'}),
   Order.aggregate([{$match:{status:{$in:done}}},{$group:{_id:null,v:{$sum:'$totals.total'}}}]),
   Order.aggregate([{$match:{status:{$ne:'cancelled'}}},{$unwind:'$items'},{$group:{_id:'$items.name',qty:{$sum:'$items.qty'}}},{$sort:{qty:-1}},{$limit:5}]),
   Reservation.countDocuments({status:{$in:['pending','confirmed']},date:{$gte:new Date().toISOString().slice(0,10)}})]);
  s.json({success:true,data:{totalOrders:total,pendingOrders:pending,revenue:rev[0]?rev[0].v:0,popular:pop,activeReservations:active}});
}));
module.exports=r;

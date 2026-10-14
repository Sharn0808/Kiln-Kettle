const crypto=require('crypto'),cfg=require('../config/env'),ApiError=require('../utils/ApiError');
const enabled=()=>!!(cfg.rzpId&&cfg.rzpSecret);
function verifySignature(orderId,paymentId,signature,secret){
  if(!secret||!signature)return false;
  const exp=crypto.createHmac('sha256',secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a=Buffer.from(exp),b=Buffer.from(String(signature));
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
async function createRazorpayOrder(amountRupees,receipt){
  if(!enabled())throw new ApiError(400,'Online payment is not configured. Choose cash on pickup/delivery.');
  const res=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Basic '+Buffer.from(`${cfg.rzpId}:${cfg.rzpSecret}`).toString('base64')},body:JSON.stringify({amount:amountRupees*100,currency:'INR',receipt})});
  if(!res.ok)throw new ApiError(502,'Payment provider rejected the request');
  return res.json();
}
module.exports={enabled,verifySignature,createRazorpayOrder};

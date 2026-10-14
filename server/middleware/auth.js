const jwt=require('jsonwebtoken'),cfg=require('../config/env'),ApiError=require('../utils/ApiError'),{User}=require('../models');
const h=fn=>(q,s,n)=>Promise.resolve(fn(q,s,n)).catch(n);
const protect=h(async(q,s,n)=>{
  const t=(q.headers.authorization||'').replace(/^Bearer /,'');
  if(!t)throw new ApiError(401,'Please sign in');
  let p;try{p=jwt.verify(t,cfg.jwt)}catch{throw new ApiError(401,'Session expired. Please sign in again')}
  const u=await User.findById(p.id);if(!u)throw new ApiError(401,'Account not found');
  q.user=u;n();
});
const adminOnly=(q,s,n)=>q.user&&q.user.role==='admin'?n():n(new ApiError(403,'Admin access required'));
const errorHandler=(e,q,s,n)=>{
  if(e.name==='ZodError')return s.status(400).json({success:false,message:'Please check the highlighted fields',errors:e.issues.map(i=>({field:i.path.join('.'),message:i.message}))});
  if(e.code===11000)return s.status(409).json({success:false,message:'That slot or value is already taken'});
  if(e.name==='CastError')return s.status(400).json({success:false,message:'Invalid id'});
  const status=e.status||500;if(status===500)console.error(e);
  s.status(status).json({success:false,message:status===500?'Something went wrong':e.message});
};
module.exports={h,protect,adminOnly,errorHandler};

const r=require('express').Router(),{z}=require('zod'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),rate=require('express-rate-limit');
const cfg=require('../config/env'),ApiError=require('../utils/ApiError'),{User}=require('../models'),{h,protect}=require('../middleware/auth');
const limit=rate({windowMs:15*6e4,limit:20,standardHeaders:true,legacyHeaders:false,message:{success:false,message:'Too many attempts. Try again later'}});
const sign=u=>jwt.sign({id:u._id},cfg.jwt,{expiresIn:'7d'});
const pub=u=>({id:u._id,name:u.name,email:u.email,role:u.role,phone:u.phone});
const reg=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email(),password:z.string().min(8).max(100),phone:z.string().regex(/^[6-9]\d{9}$/,'Enter a 10-digit mobile number').optional()});
r.post('/auth/register',limit,h(async(q,s)=>{
  const b=reg.parse(q.body);
  if(await User.findOne({email:b.email.toLowerCase()}))throw new ApiError(409,'An account with this email already exists');
  const u=await User.create({...b,password:await bcrypt.hash(b.password,12),role:'customer'}); // role is never taken from the client
  s.status(201).json({success:true,data:{token:sign(u),user:pub(u)}});
}));
r.post('/auth/login',limit,h(async(q,s)=>{
  const b=z.object({email:z.string().email(),password:z.string().min(1)}).parse(q.body);
  const u=await User.findOne({email:b.email.toLowerCase()}).select('+password');
  if(!u||!(await bcrypt.compare(b.password,u.password)))throw new ApiError(401,'Incorrect email or password');
  s.json({success:true,data:{token:sign(u),user:pub(u)}});
}));
r.get('/auth/me',protect,h(async(q,s)=>s.json({success:true,data:pub(q.user)})));
module.exports=r;

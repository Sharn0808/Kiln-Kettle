const r=require('express').Router(),{z}=require('zod'),ApiError=require('../utils/ApiError'),{MenuItem}=require('../models'),{h,protect,adminOnly}=require('../middleware/auth');
const item=z.object({name:z.string().trim().min(2),category:z.enum(['Coffee','Breakfast','Burgers','Pizza','Desserts','Beverages']),description:z.string().trim().min(5),price:z.number().min(0).max(100000),veg:z.boolean(),image:z.string().url().optional().or(z.literal('')),available:z.boolean().default(true),ingredients:z.array(z.string()).default([]),allergens:z.array(z.string()).default([]),sizes:z.array(z.object({name:z.string(),delta:z.number()})).default([]),extras:z.array(z.object({name:z.string(),price:z.number().min(0)})).default([])});
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
r.get('/menu',h(async(q,s)=>{
  const f={archived:false},{category,veg,search,sort}=q.query;
  if(typeof category==='string')f.category=category;
  if(veg==='true')f.veg=true;
  if(typeof search==='string'&&search)f.name=new RegExp(esc(search.slice(0,40)),'i');
  const o=sort==='price_asc'?{price:1}:sort==='price_desc'?{price:-1}:{popularity:-1};
  s.json({success:true,data:await MenuItem.find(f).sort(o)});
}));
r.get('/menu/:id',h(async(q,s)=>{const m=await MenuItem.findOne({_id:q.params.id,archived:false});if(!m)throw new ApiError(404,'Dish not found');s.json({success:true,data:m})}));
r.post('/menu',protect,adminOnly,h(async(q,s)=>s.status(201).json({success:true,data:await MenuItem.create(item.parse(q.body))})));
r.put('/menu/:id',protect,adminOnly,h(async(q,s)=>{const m=await MenuItem.findByIdAndUpdate(q.params.id,item.partial().parse(q.body),{new:true,runValidators:true});if(!m)throw new ApiError(404,'Dish not found');s.json({success:true,data:m})}));
r.delete('/menu/:id',protect,adminOnly,h(async(q,s)=>{const m=await MenuItem.findByIdAndUpdate(q.params.id,{archived:true,available:false});if(!m)throw new ApiError(404,'Dish not found');s.json({success:true,data:{archived:true}})})); // archived so past orders keep their history
module.exports=r;

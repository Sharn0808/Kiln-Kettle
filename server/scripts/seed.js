const mongoose=require('mongoose'),bcrypt=require('bcryptjs'),cfg=require('../config/env'),{User,MenuItem,Coupon,Settings}=require('../models');
const sz=[{name:'Regular',delta:0},{name:'Large',delta:60}];
const D=[['Flat white','Coffee',190,1,95,'Double ristretto with silky steamed milk.',sz,[['Extra shot',40],['Oat milk',40]]],['Cardamom latte','Coffee',220,1,80,'Espresso, house cardamom syrup, steamed milk.',sz,[['Extra shot',40]]],
['Shakshuka toast','Breakfast',340,1,88,'Spiced tomato, baked egg and herbs on sourdough.',[],[['Fried egg',30]]],['Masala omelette','Breakfast',280,0,70,'Three eggs, green chilli, onion, buttered pav.',[],[['Extra pav',20]]],
['Smoked chicken burger','Burgers',420,0,92,'Brioche, smoked thigh, pickled onion, aioli.',[],[['Extra cheese',40]]],['Paneer tikka burger','Burgers',380,1,76,'Charred paneer, mint chutney, slaw.',[],[['Extra cheese',40]]],
['Margherita','Pizza',460,1,90,'San Marzano tomato, fior di latte, basil.',sz,[['Chilli oil',20]]],['Fennel sausage pizza','Pizza',540,0,72,'Fennel sausage, chilli honey, mozzarella.',sz,[['Extra cheese',50]]],
['Burnt basque cheesecake','Desserts',320,1,85,'Caramelised top, creamy centre, berry compote.',[],[]],['Olive oil cake','Desserts',260,1,60,'Citrus and almond with whipped cream.',[],[['Gelato',60]]],
['Cold brew tonic','Beverages',210,1,68,'16-hour cold brew over tonic and orange.',sz,[]],['Fresh lime soda','Beverages',150,1,55,'Sweet, salted or mixed.',sz,[['Mint',10]]]];
(async()=>{
  await mongoose.connect(cfg.mongo);
  const {ADMIN_EMAIL:e,ADMIN_PASSWORD:p}=process.env;
  if(!e||!p||p.length<12)throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of 12+ characters in .env');
  await User.updateOne({email:e.toLowerCase()},{$setOnInsert:{name:'Owner',email:e.toLowerCase(),password:await bcrypt.hash(p,12),role:'admin'}},{upsert:true});
  await Settings.updateOne({key:'main'},{$setOnInsert:{key:'main',address:'12 Sample Lane, Your City (sample)',phone:'+91 00000 00000',email:'hello@kilnandkettle.example',paymentMethods:['cod']}},{upsert:true});
  if(!(await MenuItem.countDocuments()))await MenuItem.insertMany(D.map(d=>({name:d[0],category:d[1],price:d[2],veg:!!d[3],popularity:d[4],description:d[5],sizes:d[6],extras:d[7].map(x=>({name:x[0],price:x[1]}))})));
  for(const c of [{code:'WELCOME10',percent:10,minSubtotal:0},{code:'CHAI15',percent:15,minSubtotal:400}])await Coupon.updateOne({code:c.code},{$setOnInsert:c},{upsert:true});
  console.log('Seed complete. Admin:',e);await mongoose.disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});

const express=require('express'),cors=require('cors'),helmet=require('helmet'),rate=require('express-rate-limit'),cfg=require('./config/env'),{errorHandler}=require('./middleware/auth');
const app=express();
app.use(helmet());app.use(cors({origin:cfg.client}));app.use(express.json({limit:'100kb'}));
app.use('/api',rate({windowMs:6e4,limit:200,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(q,s)=>s.json({success:true}));
['auth','menu','orders','reservations','misc'].forEach(n=>app.use('/api',require('./routes/'+n)));
app.use((q,s)=>s.status(404).json({success:false,message:'Not found'}));
app.use(errorHandler);
module.exports=app;

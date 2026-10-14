const mongoose=require('mongoose'),cfg=require('./config/env'),app=require('./app');
mongoose.connect(cfg.mongo).then(()=>app.listen(cfg.port,()=>console.log(`API on :${cfg.port}`))).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)});

require('dotenv').config();
const e=process.env,test=e.NODE_ENV==='test';
const miss=['MONGODB_URI','JWT_SECRET','CLIENT_URL'].filter(k=>!e[k]);
if(!test&&miss.length)throw new Error('Missing environment variables: '+miss.join(', '));
if(!test&&e.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be at least 32 characters');
module.exports={port:+e.PORT||5000,mongo:e.MONGODB_URI,jwt:e.JWT_SECRET,client:e.CLIENT_URL,rzpId:e.RAZORPAY_KEY_ID,rzpSecret:e.RAZORPAY_KEY_SECRET};

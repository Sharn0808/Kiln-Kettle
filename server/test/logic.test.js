process.env.NODE_ENV='test';
const t=require('node:test'),a=require('node:assert'),crypto=require('crypto');
const {price}=require('../services/pricing'),R=require('../services/reservations'),{canMove}=require('../services/orderFlow'),pay=require('../services/payment');
const st={freeDeliveryAbove:600,deliveryCharge:40,taxPercent:5,openTime:'08:00',closeTime:'22:00',utcOffsetMinutes:330,reservationMinutes:90,tables:[2,4,4],cancelHoursBefore:2};
const item={_id:'1',name:'Pizza',price:400,available:true,archived:false,sizes:[{name:'Large',delta:60}],extras:[{name:'Cheese',price:50}]};
const menu=new Map([['1',item]]);
t.test('server computes totals, ignoring any client price',()=>{
  const r=price([{menuItem:'1',qty:2,size:'Large',extras:['Cheese'],price:1}],menu,st,'takeaway',null);
  a.equal(r.totals.subtotal,1020);a.equal(r.totals.tax,51);a.equal(r.totals.total,1071);
});
t.test('delivery charge and coupon',()=>{
  const r=price([{menuItem:'1',qty:1}],menu,st,'delivery',{active:true,percent:10,minSubtotal:0});
  a.equal(r.totals.discount,40);a.equal(r.totals.delivery,40);a.equal(r.totals.total,360+40+18);
});
t.test('rejects bad quantity, option and unavailable item',()=>{
  a.throws(()=>price([{menuItem:'1',qty:0}],menu,st,'takeaway'));
  a.throws(()=>price([{menuItem:'1',qty:1,size:'Huge'}],menu,st,'takeaway'));
  a.throws(()=>price([{menuItem:'1',qty:1}],new Map([['1',{...item,available:false}]]),st,'takeaway'));
});
t.test('reservation conflicts pick smallest free table, then run out',()=>{
  const ex=[];const mk=()=>({date:'2030-01-01',time:'19:00',guests:2});
  const x=R.assignTable(ex,mk(),st.tables,90);a.equal(x,0);ex.push({...mk(),table:x});
  const y=R.assignTable(ex,mk(),st.tables,90);a.equal(y,1);ex.push({...mk(),table:y});
  ex.push({...mk(),table:2});a.equal(R.assignTable(ex,mk(),st.tables,90),-1);
  a.equal(R.assignTable(ex,{...mk(),time:'21:00'},st.tables,90),0);
});
t.test('slot validation: past time and closing time',()=>{
  a.ok(R.validateSlot({date:'2020-01-01',time:'12:00',guests:2},st).length);
  a.ok(R.validateSlot({date:'2099-01-01',time:'21:30',guests:2},st).length);
  a.equal(R.validateSlot({date:'2099-01-01',time:'12:00',guests:2},st).length,0);
});
t.test('cancellation window',()=>{
  const r={date:'2030-01-01',time:'12:00'},s=R.startMs(r.date,r.time,330);
  a.equal(R.canCancel(r,st,s-3*36e5),true);a.equal(R.canCancel(r,st,s-36e5),false);
});
t.test('order status transitions respect order type',()=>{
  a.ok(canMove('pending','confirmed','dine-in'));a.ok(!canMove('pending','delivered','delivery'));
  a.ok(canMove('preparing','out_for_delivery','delivery'));a.ok(!canMove('preparing','out_for_delivery','takeaway'));
  a.ok(canMove('preparing','ready','takeaway'));a.ok(!canMove('delivered','pending','delivery'));
});
t.test('razorpay signature verification',()=>{
  const sig=crypto.createHmac('sha256','sec').update('o1|p1').digest('hex');
  a.ok(pay.verifySignature('o1','p1',sig,'sec'));a.ok(!pay.verifySignature('o1','p2',sig,'sec'));a.ok(!pay.verifySignature('o1','p1','',null));
});

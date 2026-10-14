const ApiError=require('../utils/ApiError');
// Pure function: the server is the only source of truth for prices.
function price(lines,menu,settings,orderType,coupon,now=new Date()){
  const items=lines.map(l=>{
    const m=menu.get(String(l.menuItem));
    if(!m||m.archived)throw new ApiError(400,'An item in your cart is no longer on the menu');
    if(!m.available)throw new ApiError(400,`${m.name} is currently unavailable`);
    if(!Number.isInteger(l.qty)||l.qty<1||l.qty>20)throw new ApiError(400,'Quantity must be between 1 and 20');
    let unit=m.price;
    if(l.size){const s=(m.sizes||[]).find(x=>x.name===l.size);if(!s)throw new ApiError(400,`Invalid size for ${m.name}`);unit+=s.delta}
    for(const n of l.extras||[]){const x=(m.extras||[]).find(e=>e.name===n);if(!x)throw new ApiError(400,`Invalid extra "${n}" for ${m.name}`);unit+=x.price}
    return{menuItem:m._id,name:m.name,size:l.size||'',extras:l.extras||[],note:l.note||'',qty:l.qty,unitPrice:unit,lineTotal:unit*l.qty};
  });
  const subtotal=items.reduce((a,i)=>a+i.lineTotal,0);
  let discount=0;
  if(coupon){
    if(!coupon.active||(coupon.expiresAt&&coupon.expiresAt<now))throw new ApiError(400,'This coupon is not valid');
    if(subtotal<coupon.minSubtotal)throw new ApiError(400,`This coupon needs a subtotal of at least ₹${coupon.minSubtotal}`);
    discount=Math.round(subtotal*coupon.percent/100);
  }
  const net=subtotal-discount;
  const delivery=orderType==='delivery'&&net<settings.freeDeliveryAbove?settings.deliveryCharge:0;
  const tax=Math.round(net*settings.taxPercent/100);
  return{items,totals:{subtotal,discount,delivery,tax,total:net+delivery+tax}};
}
module.exports={price};

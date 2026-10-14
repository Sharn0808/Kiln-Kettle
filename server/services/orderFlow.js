const NEXT={pending:['confirmed','cancelled'],confirmed:['preparing','cancelled'],preparing:['ready','out_for_delivery'],ready:['completed'],out_for_delivery:['delivered'],completed:[],delivered:[],cancelled:[]};
function canMove(from,to,orderType){
  if(!(NEXT[from]||[]).includes(to))return false;
  if(to==='out_for_delivery'||to==='delivered')return orderType==='delivery';
  if(to==='ready'||to==='completed')return orderType!=='delivery';
  return true;
}
module.exports={NEXT,canMove};

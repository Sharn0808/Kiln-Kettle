export default function Plate({item}){
  if(item.image)return <img src={item.image} alt={item.name} loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/>;
  let h=0;for(const c of item.name)h=(h*31+c.charCodeAt(0))%360;
  return <svg viewBox="0 0 100 100" role="img" aria-label={item.name}><rect width="100" height="100" fill={`hsl(${h} 35% 85%)`}/><circle cx="50" cy="50" r="40" fill="#fff" opacity=".7"/><circle cx="50" cy="50" r="32" fill={`hsl(${h} 45% 38%)`}/><circle cx="42" cy="44" r="7" fill={`hsl(${(h+40)%360} 60% 70%)`}/><circle cx="58" cy="56" r="9" fill={`hsl(${(h+80)%360} 45% 65%)`}/></svg>;
}

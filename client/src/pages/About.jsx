import {Link} from 'react-router-dom';
const V=[['Traceable beans','Single-origin coffee, roasted in small batches every Tuesday.'],['Slow dough','Sourdough bases rest for 48 hours before they meet the oven.'],['Cooked to order','Nothing waits under a heat lamp. If it is on your table, it was just made.']];
const T=[['Head chef','Sample name','Leads the wood-oven kitchen and writes the seasonal menu.'],['Head roaster','Sample name','Chooses the beans and roasts each batch.'],['Front of house','Sample name','Runs the floor and keeps every table happy.']];
export default function About(){return <div className="wrap sec"><h2>Small kitchen, long memory.</h2>
  <p className="mute big">Kiln &amp; Kettle began as a coffee cart and grew around a single wood oven. We buy beans from farms we can name, flour from a mill an hour away, and cook what the week gives us.</p>
  <div className="stats">{V.map(([a,b])=><div key={a}><b style={{fontSize:20}}>{a}</b><span className="mute">{b}</span></div>)}</div>
  <h3 style={{marginTop:36}}>The team</h3><p className="mute">Sample content: the owner replaces these names and descriptions.</p>
  <div className="stats">{T.map(([r,n,d])=><div key={r}><b style={{fontSize:20}}>{r}</b><span>{n}</span><br/><span className="mute">{d}</span></div>)}</div>
  <p><Link className="btn" to="/">Explore the menu</Link> <Link className="btn alt" to="/reserve">Reserve a table</Link></p></div>}

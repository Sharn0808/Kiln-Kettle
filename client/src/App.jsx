import {Routes,Route,Link,NavLink,Navigate,useLocation} from 'react-router-dom';
import {useApp} from './store';
import Home from './pages/Home';import Checkout from './pages/Checkout';import Orders from './pages/Orders';import Reserve from './pages/Reserve';import Auth from './pages/Auth';import Admin from './pages/Admin';import About from './pages/About';import Contact from './pages/Contact';
function Guard({admin,children}){const {user,ready}=useApp(),loc=useLocation();
  if(!ready)return <p className="wrap">Loading…</p>;
  if(!user)return <Navigate to="/login" state={{from:loc.pathname}} replace/>;
  if(admin&&user.role!=='admin')return <Navigate to="/" replace/>;
  return children}
export default function App(){
  const {user,logout,cart}=useApp(),n=cart.reduce((a,c)=>a+c.qty,0);
  return <>
    <header><div className="wrap bar"><Link className="logo" to="/">Kiln <i>&amp;</i> Kettle</Link>
      <nav><NavLink to="/">Menu</NavLink><NavLink to="/about">About</NavLink><NavLink to="/reserve">Reservations</NavLink><NavLink to="/contact">Contact</NavLink>{user&&<NavLink to="/orders">My orders</NavLink>}{user?.role==='admin'&&<NavLink to="/admin">Admin</NavLink>}</nav>
      <div className="acts"><Link className="btn" to="/checkout">Cart{n>0&&<b className="cnt">{n}</b>}</Link>
        {user?<button className="btn alt" onClick={logout}>Sign out</button>:<Link className="btn alt" to="/login">Sign in</Link>}</div></div></header>
    <main><Routes>
      <Route path="/" element={<Home/>}/><Route path="/checkout" element={<Checkout/>}/>
      <Route path="/reserve" element={<Guard><Reserve/></Guard>}/><Route path="/orders" element={<Guard><Orders/></Guard>}/>
      <Route path="/admin" element={<Guard admin><Admin/></Guard>}/>
      <Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="/login" element={<Auth/>}/><Route path="/register" element={<Auth register/>}/>
      <Route path="*" element={<div className="wrap sec"><h2>Page not found</h2><Link to="/">Back to the menu</Link></div>}/></Routes></main>
    <footer><div className="wrap">© Kiln &amp; Kettle · sample brand · 12 Sample Lane, Your City</div></footer></>;
}

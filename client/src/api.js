import axios from 'axios';
const api=axios.create({baseURL:'/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('kk_token');if(t)c.headers.Authorization='Bearer '+t;return c});
export const err=e=>{const d=e.response?.data;return d?.errors?.length?d.errors.map(x=>x.message).join('. '):d?.message||'Could not reach the server. Is the API running?'};
export const R=n=>'₹'+Math.round(n);
export default api;

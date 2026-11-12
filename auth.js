(()=>{
'use strict';
const SUPABASE_URL='https://qqkpcoyrwptvhkbvycly.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_yzRotn7ehUTSP_09kuKBBw_P47n-GDi';
const BASE='https://robsonmarcondes.github.io/flowt-mvp/';
let client=null;
function sb(){
  if(client) return client;
  if(!window.supabase || !window.supabase.createClient) throw new Error('Biblioteca do Supabase não carregou.');
  client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  return client;
}
function message(text,type='info'){
  const box=document.getElementById('authMessage');
  if(!box){alert(text);return}
  box.textContent=text; box.className='authMessage '+type; box.hidden=false;
}
async function emailLogin(email,password){
  message('Entrando...');
  const {error}=await sb().auth.signInWithPassword({email,password});
  if(error) throw error;
  location.href=BASE+'dashboard.html';
}
async function emailSignup(name,email,password){
  message('Criando sua conta...');
  const {data,error}=await sb().auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:BASE+'dashboard.html'}});
  if(error) throw error;
  if(data.session) location.href=BASE+'dashboard.html';
  else message('Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar.','ok');
}
async function googleLogin(calendar=false){
  message(calendar?'Abrindo autorização do Google Calendar...':'Abrindo login do Google...');
  const options={redirectTo:BASE+'dashboard.html'};
  if(calendar){
    options.scopes='https://www.googleapis.com/auth/calendar.events';
    options.queryParams={access_type:'offline',prompt:'consent'};
  }
  const {error}=await sb().auth.signInWithOAuth({provider:'google',options});
  if(error) throw error;
}
async function session(){const {data,error}=await sb().auth.getSession();if(error)throw error;return data.session}
async function signOut(){await sb().auth.signOut();location.href=BASE}
window.FLOWT_AUTH={sb,message,emailLogin,emailSignup,googleLogin,session,signOut,BASE};
})();
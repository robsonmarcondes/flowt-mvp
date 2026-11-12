(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const today=()=>new Date().toISOString().slice(0,10), id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
let tasks=get('flowt.tasks',[]), profile=get('flowt.profile',{name:'Usuário FLOWT',email:''}), prefs=get('flowt.prefs',{max:3,reward:''}), editId=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function bootProfile(){const q=new URLSearchParams(location.search);profile.name=q.get('nome')||profile.name;profile.email=q.get('email')||profile.email;if(q.get('google')){profile.name='Usuário Google';profile.email='google@flowt.app'}set('flowt.profile',profile);if(location.search)history.replaceState({},'',location.pathname)}
function seed(){if(tasks.length)return;tasks=[
{id:id(),title:'Finalizar apresentação estratégica',date:today(),time:'',priority:'high',project:'Trabalho',bucket:'today',done:false,created:Date.now()-3000},
{id:id(),title:'Ligar para fornecedor',date:today(),time:'09:45',priority:'medium',project:'Trabalho',bucket:'today',done:false,created:Date.now()-2000},
{id:id(),title:'Treino',date:today(),time:'18:00',priority:'medium',project:'Pessoal',bucket:'today',done:false,created:Date.now()-1000}];set('flowt.tasks',tasks)}
const ptxt=p=>p==='high'?'Alta':p==='low'?'Baixa':'Média';
const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'Sem data';
function task(t){return `<div class="task"><button class="check ${t.done?'done':''}" data-act="toggle" data-id="${t.id}">${t.done?'✓':''}</button><div><b class="${t.done?'strike':''}">${esc(t.title)}</b><div class="meta">${fmt(t.date)}${t.time?' • '+t.time:''}${t.project?' • '+esc(t.project):''}</div></div><div class="tools"><span class="tag ${t.priority}">${ptxt(t.priority)}</span><button data-act="edit" data-id="${t.id}">✎</button><button data-act="del" data-id="${t.id}">×</button></div></div>`}
function agenda(t){return `<div class="row"><strong>${t.time||'—'}</strong><div><b>${esc(t.title)}</b><div class="meta">${fmt(t.date)}${t.project?' • '+esc(t.project):''}</div></div><button data-act="edit" data-id="${t.id}">✎</button></div>`}
function sort(a,b){const p={high:0,medium:1,low:2};return p[a.priority]-p[b.priority]||(a.time||'99').localeCompare(b.time||'99')}
function render(){
 $('#sideName').textContent=profile.name;$('#sideEmail').textContent=profile.email||'sem e-mail';$('#accountName').value=profile.name;$('#accountEmail').value=profile.email;$('#maxPriorities').value=prefs.max||3;$('#reward').value=prefs.reward||'';
 const focus=tasks.filter(t=>t.bucket==='today'&&(!t.date||t.date===today())).sort(sort).slice(0,+prefs.max||3);
 $('#focus').innerHTML=focus.length?focus.map(task).join(''):'<p class="empty">Nenhuma prioridade definida.</p>';
 const ag=tasks.filter(t=>t.date===today()&&t.time).sort((a,b)=>a.time.localeCompare(b.time));$('#todayAgenda').innerHTML=ag.length?ag.map(agenda).join(''):'<p class="empty">Nenhum horário agendado.</p>';
 const later=tasks.filter(t=>t.bucket==='later'&&!t.done).sort(sort);$('#later').innerHTML=later.length?later.map(task).join(''):'<p class="empty">Nada esperando.</p>';
 const inbox=tasks.filter(t=>t.bucket==='inbox').sort((a,b)=>b.created-a.created);$('#inboxList').innerHTML=inbox.length?inbox.map(task).join(''):'<p class="empty">Inbox vazia.</p>';
 const allag=tasks.filter(t=>t.date&&t.time).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$('#agendaList').innerHTML=allag.length?allag.map(agenda).join(''):'<p class="empty">Nenhuma tarefa agendada.</p>';
 const done=focus.filter(t=>t.done).length, pct=focus.length?Math.round(done/focus.length*100):0;$('#progress').textContent=`${done}/${focus.length}`;$('#pct').textContent=pct+'%';$('#bar').style.width=pct+'%';$('#coach').textContent=!focus.length?'Defina suas prioridades do dia.':done===focus.length?'Prioridades principais concluídas. Registre sua microvitória.':`Próxima prioridade: ${focus.find(t=>!t.done).title}`;
 const pm={};tasks.filter(t=>t.project).forEach(t=>{pm[t.project]??={n:0,d:0};pm[t.project].n++;if(t.done)pm[t.project].d++});$('#projects').innerHTML=Object.entries(pm).map(([n,v])=>`<div class="project"><div><b>${esc(n)}</b><div class="meta">${v.d} de ${v.n} concluídas</div></div><span>${Math.round(v.d/v.n*100)||0}%</span></div>`).join('')||'<p class="empty">Nenhum projeto ainda.</p>';
 const allDone=tasks.filter(t=>t.done).length;$('#created').textContent=tasks.length;$('#done').textContent=allDone;$('#rate').textContent=(tasks.length?Math.round(allDone/tasks.length*100):0)+'%';$('#history').innerHTML=[...tasks].sort((a,b)=>b.created-a.created).slice(0,10).map(t=>`<div class="project"><div><b>${esc(t.title)}</b><div class="meta">${t.done?'Concluída':'Criada'}</div></div><span>${t.done?'✓':'•'}</span></div>`).join('')||'<p class="empty">Sem histórico.</p>';
 $('#rewardStatus').textContent=prefs.reward?'Recompensa atual: '+prefs.reward:'';
}
function view(v){$$('.view').forEach(x=>x.hidden=true);$('#v-'+v).hidden=false;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));const t={today:['Bom dia. Vamos fazer o que importa.','Prioridade, tempo e execução.'],inbox:['Inbox','Capture primeiro. Organize depois.'],agenda:['Agenda','O que já tem hora marcada.'],projects:['Projetos','Objetivos virando execução.'],evolution:['Evolução','Veja o que você realmente fez.'],account:['Conta','Perfil e preferências deste dispositivo.']}[v];$('#title').textContent=t[0];$('#sub').textContent=t[1];$('#floatBox').hidden=true}
function openModal(base={}){editId=base.id||null;$('#mTitle').textContent=editId?'Editar tarefa':'Nova tarefa';$('#tTitle').value=base.title||'';$('#tDate').value=base.date??today();$('#tTime').value=base.time||'';$('#tPriority').value=base.priority||'medium';$('#tProject').value=base.project||'';$('#tBucket').value=base.bucket||'today';$('#modal').hidden=false}
function closeModal(){$('#modal').hidden=true;editId=null}
function saveTask(){const title=$('#tTitle').value.trim();if(!title)return alert('Digite a tarefa.');const data={title,date:$('#tDate').value,time:$('#tTime').value,priority:$('#tPriority').value,project:$('#tProject').value.trim(),bucket:$('#tBucket').value};if(editId)Object.assign(tasks.find(t=>t.id===editId),data);else tasks.push({id:id(),...data,done:false,created:Date.now()});set('flowt.tasks',tasks);closeModal();render()}
function action(e){const b=e.target.closest('[data-act]');if(!b)return;const t=tasks.find(x=>x.id===b.dataset.id);if(!t)return;if(b.dataset.act==='toggle')t.done=!t.done;if(b.dataset.act==='edit')return openModal(t);if(b.dataset.act==='del'){if(!confirm('Excluir tarefa?'))return;tasks=tasks.filter(x=>x.id!==t.id)}set('flowt.tasks',tasks);render()}
function capture(){const x=$('#quick').value.trim();if(!x)return;tasks.push({id:id(),title:x,date:'',time:'',priority:'medium',project:'',bucket:'inbox',done:false,created:Date.now()});set('flowt.tasks',tasks);$('#quick').value='';render();view('inbox')}
function bind(){
 $$('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));document.body.addEventListener('click',action);
 $('#addTask').onclick=()=>openModal();$('#addInbox').onclick=()=>openModal({bucket:'inbox',date:''});$('#addAgenda').onclick=()=>openModal({date:today(),bucket:'today'});$('#addProject').onclick=()=>openModal();
 $('#floatTab').onclick=()=>$('#floatBox').hidden=!$('#floatBox').hidden;$('#closeFloat').onclick=()=>$('#floatBox').hidden=true;$('#quickSave').onclick=capture;$('#quick').onkeydown=e=>{if(e.key==='Enter')capture()};
 $('#closeModal').onclick=closeModal;$('#cancelModal').onclick=closeModal;$('#saveTask').onclick=saveTask;$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
 $('#saveAccount').onclick=()=>{profile={name:$('#accountName').value.trim()||'Usuário FLOWT',email:$('#accountEmail').value.trim()};set('flowt.profile',profile);render();alert('Conta atualizada neste dispositivo.')};
 $('#saveReward').onclick=()=>{prefs.reward=$('#reward').value.trim();set('flowt.prefs',prefs);render()};$('#savePrefs').onclick=()=>{prefs.max=+$('#maxPriorities').value;set('flowt.prefs',prefs);render();alert('Preferências salvas.')};
 $('#clearData').onclick=()=>{if(confirm('Apagar todos os dados locais do FLOWT?')){localStorage.clear();location.href='index.html'}};$('#logout').onclick=()=>location.href='index.html';
}
function init(){bootProfile();seed();$('#date').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});bind();render()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
(() => {
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
$('#year').textContent=new Date().getFullYear();
const toggle=$('#navToggle'),nav=$('#nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const rev=$$('.reveal');
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});rev.forEach(x=>io.observe(x))}else rev.forEach(x=>x.classList.add('visible'));
const form=$('#projectForm'), progress=$('#progress'), success=$('#success'), idea=$('#idea'), count=$('#count');
const ids=['service','idea','name','email'];
function err(id,msg){const el=$('#'+id),e=document.querySelector(`[data-error="${id}"]`);el.style.borderColor=msg?'#ed7784':'';if(e)e.textContent=msg||''}
function update(){const n=ids.filter(id=>$('#'+id).value.trim()).length;progress.style.width=n/ids.length*100+'%'}
function validate(id){const v=$('#'+id).value.trim();let m='';if(id==='service'&&!v)m='Please choose a service.';if(id==='idea'&&v.length<10)m='Give us a little more detail (10+ characters).';if(id==='name'&&v.length<2)m='Please enter your name.';if(id==='email'&&!/^\S+@\S+\.\S+$/.test(v))m='Please enter a valid email.';err(id,m);return !m}
ids.forEach(id=>$('#'+id).addEventListener('input',update));
idea.addEventListener('input',()=>count.textContent=idea.value.length+' / 1000');
form.addEventListener('submit',e=>{e.preventDefault();success.classList.remove('show');const ok=ids.map(validate).every(Boolean);update();if(!ok){form.querySelector('input,textarea,select').focus();return}success.classList.add('show')});
const copy={project:['START A PROJECT','Bring us the possibility.',"We'll help turn the first conversation into a clear next step."],partner:['PARTNER WITH US','Add Innovexa to your team.','Bring us in where strategy, design or engineering needs more momentum.'],hello:['JUST SAY HELLO','Start with a simple hello.','Questions, introductions or future ideas are always welcome.']};
$$('[data-path]').forEach(card=>card.addEventListener('click',()=>{ $$('[data-path]').forEach(x=>x.classList.remove('active'));card.classList.add('active');const c=copy[card.dataset.path];$('#readout').innerHTML=`<small>${c[0]}</small><b>${c[1]}</b><span>${c[2]}</span>`}));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));
})();
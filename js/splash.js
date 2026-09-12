/**
 * Innovexa Technologies — cinematic particle assembly
 * Frontend only. The real logo image is sampled as an off-screen target;
 * the visible mark is created entirely from canvas particles.
 */
(function(){
  'use strict';
  var splash=document.getElementById('splashScreen');
  if(!splash) return;
  var canvas=document.getElementById('splashCanvas');
  var img=document.getElementById('splashLogo');
  var name=document.getElementById('splashName');
  var kicker=document.getElementById('splashKicker');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var done=false, start=performance.now(), particles=[], raf=0;
  var DURATION=2300, HOLD=420;

  function removeSplash(){
    if(done)return; done=true;
    splash.classList.add('is-leaving');
    setTimeout(function(){ if(splash.parentNode)splash.parentNode.removeChild(splash); },800);
  }
  function simple(){
    splash.classList.add('reduced-motion');
    requestAnimationFrame(function(){ splash.classList.add('logo-ready'); });
    setTimeout(function(){ name.classList.add('is-visible'); kicker.classList.add('is-visible'); },420);
    setTimeout(removeSplash,1800);
  }
  if(reduced){ simple(); return; }
  if(!canvas || !img){ simple(); return; }
  var ctx=canvas.getContext('2d');
  if(!ctx){ simple(); return; }

  var W=0,H=0,dpr=1;
  function resize(){
    W=window.innerWidth; H=window.innerHeight;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  function ease(t){
    t=Math.max(0,Math.min(1,t));
    return 1-Math.pow(1-t,4);
  }
  function makeTargets(){
    var off=document.createElement('canvas'), size=260;
    off.width=size; off.height=size;
    var o=off.getContext('2d');
    try{o.drawImage(img,0,0,size,size);}catch(e){return null;}
    var data=o.getImageData(0,0,size,size).data, pts=[];
    /* The source logo is square. Only sample the blue emblem in its upper
       half so the separate company name can appear underneath naturally. */
    for(var y=30;y<150;y+=2){
      for(var x=45;x<215;x+=2){
        var i=(y*size+x)*4,r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
        if(a>80 && b>75 && b>r*1.18 && (b+g)>150){
          if(Math.random()<.78) pts.push({x:x/size,y:y/size,r:r,g:g,b:b});
        }
      }
    }
    if(pts.length<100)return null;
    return pts;
  }
  function init(targets){
    var max=innerWidth<600?720:(innerWidth<1000?1050:1500);
    var count=Math.min(max,targets.length);
    for(var i=targets.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),tmp=targets[i];targets[i]=targets[j];targets[j]=tmp;}
    targets=targets.slice(0,count);
    var markW=Math.min(420,Math.max(250,W*.34));
    var markH=markW*.56;
    var left=(W-markW)/2, top=H/2-markH*.72;
    particles=targets.map(function(t,idx){
      var tx=left+t.x*markW, ty=top+t.y*markH;
      var angle=Math.random()*Math.PI*2, radius=Math.min(W,H)*(0.28+Math.random()*.45);
      return {
        x:Math.random()*W,y:Math.random()*H,
        sx:Math.random()*W,sy:Math.random()*H,
        tx:tx,ty:ty,
        r:0.55+Math.random()*1.65,
        alpha:.28+Math.random()*.68,
        driftX:(Math.random()-.5)*18,driftY:(Math.random()-.5)*18,
        delay:Math.random()*360,
        cr:t.r,cg:t.g,cb:t.b,
        phase:Math.random()*Math.PI*2,
        halo:idx%9===0
      };
    });
    start=performance.now();
    render();
  }
  function render(now){
    if(done)return;
    if(!now)now=performance.now();
    ctx.clearRect(0,0,W,H);
    var elapsed=now-start;
    particles.forEach(function(p){
      var t=Math.max(0,Math.min(1,(elapsed-p.delay)/(DURATION-p.delay)));
      var e=ease(t);
      var sway=Math.sin(p.phase+elapsed*.0012)*p.driftX*(1-t);
      var swayY=Math.cos(p.phase+elapsed*.001)*p.driftY*(1-t);
      var x=p.sx+(p.tx-p.sx)*e+sway;
      var y=p.sy+(p.ty-p.sy)*e+swayY;
      var a=p.alpha*(t<.08?t/.08:1)*(t>.92?(1-(t-.92)/.08)*.18+.82:1);
      if(elapsed>DURATION)a=p.alpha;
      ctx.beginPath();
      ctx.fillStyle='rgba('+p.cr+','+p.cg+','+p.cb+','+a+')';
      ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
      if(p.halo && t>.72){
        ctx.beginPath();ctx.fillStyle='rgba('+p.cr+','+p.cg+','+p.cb+','+(a*.07)+')';
        ctx.arc(x,y,p.r*5.5,0,Math.PI*2);ctx.fill();
      }
    });
    if(elapsed>DURATION+120){
      splash.classList.add('logo-ready');
      name.classList.add('is-visible');
      setTimeout(function(){kicker.classList.add('is-visible');},120);
    }
    if(elapsed>DURATION+HOLD+650){cancelAnimationFrame(raf);removeSplash();return;}
    raf=requestAnimationFrame(render);
  }
  function boot(){
    img.onload=function(){
      var targets=makeTargets();
      if(targets)init(targets); else simple();
    };
    if(img.complete) img.onload();
  }
  setTimeout(function(){if(!done && particles.length===0)simple();},5000);
  boot();
})();
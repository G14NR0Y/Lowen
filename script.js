/* ================= SCROLL REVEAL ================= */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:0.2});
function startReveals(){ revealEls.forEach(el=>io.observe(el)); }  /* se activa al abrir la invitacion */

/* ================= PARALLAX ================= */
const decoEls = Array.from(document.querySelectorAll('.deco'));
function onScroll(){
  const vh = window.innerHeight;
  decoEls.forEach(el=>{
    const speed = parseFloat(el.dataset.speed || 0.2);
    const r = el.closest('section').getBoundingClientRect();
    /* distancia del centro de la seccion al centro de la pantalla: 0 cuando esta centrada */
    const offset = (r.top + r.height/2) - vh/2;
    /* desplazamiento limitado a +-22px para que NUNCA se corte en el borde de la seccion */
    const d = Math.max(-22, Math.min(22, offset * speed * 0.12));
    el.style.transform = `translateY(${d}px)`;
  });
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* ================= FOTOS FLOTANTES (velocidad aumentada) ================= */
const stage = document.getElementById('photo-stage');
const bubbles = Array.from(document.querySelectorAll('.bubble'));
const state = bubbles.map((el)=>{
  const size = el.offsetWidth;
  return {
    el, size, x:0, y:0,
    vx: (Math.random()-0.5)*1.5,   /* mas rapido que antes */
    vy: (Math.random()-0.5)*1.5,
    rot: Math.random()*30-15,
    vr: (Math.random()-0.5)*0.3
  };
});
function initPositions(){
  const w = stage.clientWidth, h = stage.clientHeight;
  state.forEach(s=>{ s.x = Math.random()*(w-s.size); s.y = Math.random()*(h-s.size); });
}
initPositions();
window.addEventListener('resize', initPositions);
function animateBubbles(){
  const w = stage.clientWidth, h = stage.clientHeight;
  state.forEach(s=>{
    s.x += s.vx; s.y += s.vy; s.rot += s.vr;
    if(s.x<=0){s.x=0; s.vx*=-1;}
    if(s.x+s.size>=w){s.x=w-s.size; s.vx*=-1;}
    if(s.y<=0){s.y=0; s.vy*=-1;}
    if(s.y+s.size>=h){s.y=h-s.size; s.vy*=-1;}
    s.el.style.transform = `translate(${s.x}px,${s.y}px) rotate(${s.rot}deg)`;
  });
  requestAnimationFrame(animateBubbles);
}
requestAnimationFrame(animateBubbles);

document.querySelectorAll('.bubble img, .img-placeholder img').forEach(img=>{
  img.addEventListener('error', ()=>{
    const wrap = img.closest('.bubble') || img.closest('.img-placeholder');
    if(wrap) wrap.classList.add('img-error');
  });
});

/* ================= LIGHTBOX ================= */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
bubbles.forEach(b=>{
  b.addEventListener('click', ()=>{
    const src = b.querySelector('img').getAttribute('src');
    lbImg.src = src;
    lightbox.classList.add('open');
  });
});
function closeLB(){ lightbox.classList.remove('open'); }
document.getElementById('lb-close').addEventListener('click', closeLB);
lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLB(); });

/* ================= RSVP -> WHATSAPP ================= */
/* ⚠️ Reemplaza este numero por el numero real de WhatsApp (con codigo de pais, sin + ni espacios) */
const WHATSAPP_NUMBER = "+51958588802";
document.getElementById('rsvp-btn').addEventListener('click', ()=>{
  const name = document.getElementById('rsvp-name').value.trim();
  const base = "Hola, confirmo mi asistencia a la baby shower de Lowen Helian el viernes 2 de octubre.";
  const msg = name ? `${base} Mi nombre es ${name}.` : base;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

/* ================= MUSICA + PANTALLA DE ENTRADA ================= */
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const intro = document.getElementById('intro');
let musicOn = false;
function setMusic(on){
  if(on){
    music.play().then(()=>{ musicOn = true; musicBtn.classList.remove('off'); musicBtn.style.opacity='1'; }).catch(()=>{});
  } else {
    music.pause(); musicOn = false; musicBtn.classList.add('off'); musicBtn.style.opacity='.75';
  }
}
/* El click en "Abrir invitacion" es la interaccion que el navegador exige para permitir el audio */
document.getElementById('open-btn').addEventListener('click', ()=>{
  setMusic(true);
  intro.classList.add('hide');
  document.body.classList.remove('locked');
  window.scrollTo(0,0);
  startReveals();
  setTimeout(()=>intro.remove(), 900);
});
musicBtn.addEventListener('click', ()=> setMusic(!musicOn));

/* ================= CUENTA REGRESIVA ================= */
const eventDate = new Date("2026-10-02T19:00:00-05:00").getTime();
function updateCountdown(){
  const diff = eventDate - Date.now();
  if(diff<=0) return;
  document.getElementById('cd-d').textContent = String(Math.floor(diff/86400000)).padStart(2,'0');
  document.getElementById('cd-h').textContent = String(Math.floor(diff%86400000/3600000)).padStart(2,'0');
  document.getElementById('cd-m').textContent = String(Math.floor(diff%3600000/60000)).padStart(2,'0');
  document.getElementById('cd-s').textContent = String(Math.floor(diff%60000/1000)).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ===== AUDIO DE ETHAN: baja la musica de fondo mientras suena ===== */
const voice = document.getElementById('voice-ethan');
const VOL_NORMAL = 1;     // volumen normal de la cancion
const VOL_BAJO   = 0.15;  // volumen mientras habla Ethan
let fadeTimer;
function fadeMusicTo(target){
  clearInterval(fadeTimer);
  fadeTimer = setInterval(()=>{
    const diff = target - music.volume;
    if(Math.abs(diff) < 0.03){ music.volume = target; clearInterval(fadeTimer); return; }
    music.volume += diff * 0.2;   // cambio suave, no brusco
  }, 60);
}
document.getElementById('voice-btn').addEventListener('click', ()=>{
  voice.paused ? voice.play() : voice.pause();
});
voice.addEventListener('play',  ()=>{ fadeMusicTo(VOL_BAJO);  document.getElementById('voice-btn').textContent = '⏸ Pausar'; });
voice.addEventListener('pause', ()=>{ fadeMusicTo(VOL_NORMAL); document.getElementById('voice-btn').textContent = '▶ Escucha a Ethan'; });
voice.addEventListener('ended', ()=>{ fadeMusicTo(VOL_NORMAL); document.getElementById('voice-btn').textContent = '▶ Escucha a Ethan'; });
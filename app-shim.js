/* Grand Fable GP - standalone app shell.
   race3d.js (copied from the Learning Zone by tools/build_standalone.sh) expects a few things from its host app. This file
   provides them for the game-only app. Storage: ONE key, "gfgp_v1" (car, upgrades, options, best times). This app shares
   its origin with the Learning Zone, so it must never read or write the Learning Zone's own storage keys or its caches. */
"use strict";
const GF_KEY="gfgp_v1";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
/* no default name (job 1107-2317): every device used to be "Racer", so two home-screen apps in one room shared a name; with none, Race a friend shows each player as their car + colour */
function gfNewProfile(){return{v:1,name:"",xp:0,race:{},trophies:[],gpCar:"falcon",gpMode:"race",gpPace:"gentle",gpAuto:false,gpTraffic:true,gpLaps:2,gpCam:"chase",gpLook:"real",gpUp:{}};}
function gfLoad(){try{const raw=localStorage.getItem(GF_KEY);if(raw){const p=JSON.parse(raw);if(p&&typeof p==="object"){if(p.name==="Racer")p.name="";return Object.assign(gfNewProfile(),p);}}}catch(e){}return gfNewProfile();}
let P=gfLoad();
function save(){try{localStorage.setItem(GF_KEY,JSON.stringify(P));}catch(e){}}
const app=$("app");
let gfToastT=0;
function toast(msg){let t=$("gfToast");if(!t){t=document.createElement("div");t.id="gfToast";document.body.appendChild(t);}t.textContent=msg;t.classList.add("show");clearTimeout(gfToastT);gfToastT=setTimeout(()=>t.classList.remove("show"),2600);}
/* tiny UI ticks (the race itself has its own engine / effects audio in race3d.js) */
let gfAC=null;
function sfx(name){try{if(!gfAC){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;gfAC=new A();}if(gfAC.state!=="running")gfAC.resume();const o=gfAC.createOscillator(),g=gfAC.createGain(),t=gfAC.currentTime,f={tick:880,good:1046,bad:220}[name]||660;
  o.frequency.value=f;o.type="triangle";g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.08,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);o.connect(g);g.connect(gfAC.destination);o.start(t);o.stop(t+0.1);}catch(e){}}
/* the Learning Zone's tutor voice is not part of the game app: speech is off, callbacks still run */
function say(){}
function sayAndThen(text,cb){if(typeof cb==="function")setTimeout(cb,0);}
function startEngine(){}function stopEngine(){}
function syncProgress(){}
function markTodayPlanDone(){}   // lesson plans (and the Learning Zone's maths boosts) do not exist in the game app
function awardTrophy(t){if(!P.trophies)P.trophies=[];if(!P.trophies.some(x=>x.type===t.type&&x.label===t.label))P.trophies.push(Object.assign({date:today()},t));save();toast((t.icon||"🏆")+" "+(t.label||"Trophy!"));}
function clearTimers(){if(typeof gpStop==="function"&&typeof R3!=="undefined"&&R3)gpStop();}
function closeOverlay(){}
function defocus(){document.body.classList.remove("learningworld");}
function showAnanseCorner(){}
function ananseSVG(size){return'<div style="font-size:'+Math.round((size||100)*0.7)+'px;line-height:1">🏎️</div>';}
function kdWebgl(){try{const c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl")||c.getContext("experimental-webgl")));}catch(e){return false;}}
function renderRace2D(){toast("This game needs a 3D-capable browser (WebGL).");renderHome();}
function startRace2D(){renderRace2D();}
function renderProfiles(){renderHome();}
/* three.js r128, shipped with the app (same file + SRI hash the Learning Zone loads from cdnjs) */
function loadThree(){return new Promise((res,rej)=>{if(window.THREE)return res();const s=document.createElement("script");s.src="vendor/three.r128.min.js";
  const to=setTimeout(()=>rej(new Error("timeout")),20000);s.onload=()=>{clearTimeout(to);res();};s.onerror=()=>{clearTimeout(to);rej(new Error("load"));};document.head.appendChild(s);});}
/* title screen: straight into the game */
function renderHome(){clearTimers();document.body.classList.remove("learningworld");
  const best=P.race||{},wins=Object.values(best).filter(b=>b&&b.place===1).length;
  app.innerHTML='<div class="gf-title fadein"><div class="gf-hero"><img src="assets/world/title.webp" alt="" onerror="this.remove()"></div>'
   +'<div class="gf-panel"><h1>GRAND FABLE <em>GP</em></h1><p>18 real 3D cars · 7 tracks · boost, jumps and drifts</p>'
   +'<button class="gf-play" onclick="sfx(\'tick\');renderRace()">▶ PLAY</button>'
   +'<div class="gf-row"><button class="gf-sm" onclick="sfx(\'tick\');renderCircuits()">🏁 Tracks</button><button class="gf-sm" onclick="sfx(\'tick\');renderCircuits(\'opts\')">⚙️ Options</button></div>'
   +(wins?'<p class="gf-note">🏆 '+wins+' track win'+(wins>1?'s':'')+' · '+(P.xp|0)+' XP</p>':'<p class="gf-note">Your cars, upgrades and best times are saved on this device.</p>')+'</div></div>';}

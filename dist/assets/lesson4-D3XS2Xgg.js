import{S as d,B as a,a as w,M as h,P as m,W as u}from"./three.module-BiaCWeGM.js";/* empty css              */import{O as f}from"./OrbitControls-C9HoQeHB.js";const t=document.querySelector("canvas.webgl"),o=new d,e={width:window.innerWidth,height:window.innerHeight},g=new a(1,1,1),x=new w({color:16711680}),r=new h(g,x);o.add(r);r.position.normalize();r.rotation.reorder("YXZ");const i=new m(75,e.width/e.height,.1,100);i.position.z=2;o.add(i);const c=new f(i,t);c.enableDamping=!0;const n=new u({canvas:t});n.setSize(e.width,e.height);n.setPixelRatio(Math.min(window.devicePixelRatio,2));window.addEventListener("mousemove",s=>{s.clientX/e.width-.5,s.clientY/e.height-.5});window.addEventListener("resize",()=>{e.width=window.innerWidth,e.height=window.innerHeight,i.aspect=e.width/e.height,i.updateProjectionMatrix(),n.setSize(e.width,e.height),n.setPixelRatio(Math.min(window.devicePixelRatio,2))});window.addEventListener("dblclick",()=>{document.fullscreenElement||document.webkitFullScreenelement?document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():t.requestFullscreen?t.requestFullscreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen()});const l=()=>{c.update(),n.render(o,i),window.requestAnimationFrame(l)};l();
//# sourceMappingURL=lesson4-D3XS2Xgg.js.map
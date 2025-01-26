import{S as G,T as R,P as W,W as q,c as L,C as b,b as v,a3 as k,aa as B,ab as D,v as I}from"./three.module-DsRrX6ca.js";/* empty css              */import{O}from"./OrbitControls-D1IyKXQA.js";import{G as j}from"./lil-gui.esm-hsJpI9MV.js";const t=new j,f=document.querySelector("canvas.webgl"),w=new G,e={};e.count=1e4;e.size=.03;e.radiusX=5;e.radiusZ=7;e.branches=3;e.spin=1;e.randomness=.7;e.randomnessPower=3;e.insideColor="#ff9752";e.outsideColor="#133ca4";let d=null,p=null,l=null;const F=new R,n=()=>{l&&(d.dispose(),p.dispose(),w.remove(l)),d=new L;const a=new Float32Array(e.count*3),m=new Float32Array(e.count*3),x=new Float32Array(e.count*3),A=new b(e.insideColor),S=new b(e.outsideColor);for(let c=0;c<e.count*3;c++){const s=c*3,g=e.radiusX,C=e.radiusZ,X=g/C,r=Math.random()*Math.sqrt(g*g+C*C),M=r*e.spin,P=c%e.branches/e.branches*Math.PI*2,T=Math.pow(Math.random(),e.randomnessPower)*(Math.random()<.5?1:-1)*e.randomness,Z=Math.pow(Math.random(),e.randomnessPower)*(Math.random()<.5?1:-1)*e.randomness,_=Math.pow(Math.random(),e.randomnessPower)*(Math.random()<.5?1:-1)*e.randomness;a[s]=(Math.cos(P+M)*r+T)*X,a[s+1]=Z*(1-r/Math.sqrt(e.radiusX*e.radiusX+e.radiusZ*e.radiusZ)),a[s+2]=Math.sin(P+M)*r+_;const u=A.clone();u.lerp(S,r/e.radiusX),m[s]=u.r,m[s+1]=u.g,m[s+2]=u.b,x[c]=e.size+1/r}d.setAttribute("position",new v(a,3)),d.setAttribute("color",new v(m,3)),d.setAttribute("size",new v(x,3)),p=new k({uniforms:{pointTexture:{value:F.load("/textures/particles/8.png")}},vertexShader:`
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (100.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,fragmentShader:`
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
                gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
            }
        `,blending:B,depthWrite:!1,vertexColors:!0}),p.alphaMap=F.load("/textures/particles/1.png"),l=new D(d,p),w.add(l)};t.add(e,"count").min(100).max(1e5).step(100).onFinishChange(n);t.add(e,"size").min(.001).max(.1).step(.001).onFinishChange(n);t.add(e,"radiusX").min(1).max(20).step(.1).onFinishChange(n);t.add(e,"radiusZ").min(1).max(20).step(.1).onFinishChange(n);t.add(e,"branches").min(2).max(10).step(1).onFinishChange(n);t.add(e,"spin").min(-5).max(5).step(.001).onFinishChange(n);t.add(e,"randomness").min(0).max(2).step(.001).onFinishChange(n);t.add(e,"randomnessPower").min(1).max(10).step(.001).onFinishChange(n);t.addColor(e,"insideColor").onFinishChange(n);t.addColor(e,"outsideColor").onFinishChange(n);n();const o={width:window.innerWidth,height:window.innerHeight};window.addEventListener("resize",()=>{o.width=window.innerWidth,o.height=window.innerHeight,i.aspect=o.width/o.height,i.updateProjectionMatrix(),h.setSize(o.width,o.height),h.setPixelRatio(Math.min(window.devicePixelRatio,2))});const i=new W(75,o.width/o.height,.1,100);i.position.x=3;i.position.y=3;i.position.z=3;w.add(i);const z=new O(i,f);z.enableDamping=!0;const h=new q({canvas:f});h.setSize(o.width,o.height);h.setPixelRatio(Math.min(window.devicePixelRatio,2));const E=new I,y=()=>{const a=E.getElapsedTime();l.rotation.y=a*.02,z.update(),h.render(w,i),window.requestAnimationFrame(y)};y();
//# sourceMappingURL=lesson14-BmwE2QLK.js.map

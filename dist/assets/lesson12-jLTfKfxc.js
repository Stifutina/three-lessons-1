import{M as u,a3 as ae,a4 as se,O as ne,B as K,V as N,S as ie,T as re,a5 as t,d as S,a0 as Z,o as w,G as q,a6 as le,q as ce,a7 as de,t as he,Q as pe,u as P,P as ue,W as fe,a2 as me,a8 as _e}from"./three.module-DLNWSUt3.js";/* empty css              */import{O as we}from"./OrbitControls-Dxb_duzi.js";import{G as ge}from"./lil-gui.esm-hsJpI9MV.js";class ve{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=G(),this._delta=0,this._elapsed=0,this._timescale=1,this._usePageVisibilityAPI=typeof document<"u"&&document.hidden!==void 0,this._usePageVisibilityAPI===!0&&(this._pageVisibilityHandler=Me.bind(this),document.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(o){return this._timescale=o,this}reset(){return this._currentTime=G()-this._startTime,this}dispose(){return this._usePageVisibilityAPI===!0&&document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this}update(o){return this._usePageVisibilityAPI===!0&&document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(o!==void 0?o:G())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function G(){return(typeof performance>"u"?Date:performance).now()}function Me(){document.hidden===!1&&this.reset()}class E extends u{constructor(){const o=E.SkyShader,s=new ae({name:o.name,uniforms:se.clone(o.uniforms),vertexShader:o.vertexShader,fragmentShader:o.fragmentShader,side:ne,depthWrite:!1});super(new K(1,1,1),s),this.isSky=!0}}E.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new N},up:{value:new N(0,1,0)}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};new ge;const X=document.querySelector("canvas.webgl"),i=new ie,e=new re;e.load("/textures/environmentMap/2k.hdr");const xe=e.load("/textures/floor/alpha.webp"),y=e.load("/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp"),R=e.load("/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp"),C=e.load("/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp"),_=e.load("/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp");y.wrapS=t;y.wrapT=t;y.repeat.set(8,8);C.wrapS=t;C.wrapT=t;C.repeat.set(8,8);R.wrapS=t;R.wrapT=t;R.repeat.set(8,8);_.wrapS=t;_.wrapT=t;_.repeat.set(8,8);y.colorSpace=S;const Q=e.load("/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp"),be=e.load("/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp"),V=e.load("/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp");Q.colorSpace=S;const g=e.load("/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp"),h=e.load("/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp"),T=e.load("/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp");g.colorSpace=S;g.repeat.set(2.4,1);h.repeat.set(2.4,1);T.repeat.set(2.4,1);g.wrapS=t;h.wrapS=t;T.wrapS=t;g.wrapT=t;h.wrapT=t;T.wrapT=t;const J=e.load("/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp"),Se=e.load("/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp"),O=e.load("/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp");J.colorSpace=S;const A=e.load("/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp"),F=e.load("/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp"),v=e.load("/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp");A.colorSpace=S;A.wrapS=t;v.wrapS=t;F.wrapS=t;A.wrapT=t;v.wrapT=t;F.wrapT=t;const ye=e.load("/textures/door/color.jpg"),Te=e.load("/textures/door/alpha.jpg"),ke=e.load("/textures/door/height.jpg"),Pe=e.load("/textures/door/normal.jpg"),Ee=e.load("/textures/door/metalness.jpg"),Re=e.load("/textures/door/roughness.jpg"),Ce=e.load("/textures/door/ambientOcclusion.jpg"),W=new u(new Z(30,30,200,200),new w({alphaMap:xe,map:y,normalMap:C,displacementMap:R,displacementScale:.3,displacementBias:-.2,aoMap:_,roughnessMap:_,metalnessMap:_,transparent:!0}));W.rotation.x=-Math.PI*.5;i.add(W);const k=new q,Y=new q;i.add(k,Y);const z=new u(new K(4,2.5,4),new w({map:Q,normalMap:be,aoMap:V,roughnessMap:V,metalnessMap:V}));z.position.y=1.25;k.add(z);const I=new u(new le(3.5,1.8,4),new w({map:g,aoMap:h,roughnessMap:h,metalnessMap:h,normalMap:T}));g.rotation=Math.PI*-.04;h.rotation=Math.PI*-.04;T.rotation=Math.PI*-.04;I.rotation.y=Math.PI*.25;I.position.y=2.5+.75;k.add(I);const j=new u(new Z(2,2,80,80),new w({alphaMap:Te,map:ye,normalMap:Pe,displacementMap:ke,displacementScale:.1,metalnessMap:Ee,roughnessMap:Re,aoMap:Ce,transparent:!0}));j.position.z=2+.01;j.position.y=1;k.add(j);const Ae=new ce(1,16,16),ze=new w({map:J,normalMap:Se,aoMap:O,roughnessMap:O,metalnessMap:O,color:"#ccffcc"}),f=new u(Ae,ze);f.scale.set(.5,.5,.5);f.position.set(.8,.3,2.3);f.rotation.x=Math.PI*.75;const L=f.clone();L.position.set(1.5,.2,2.4);L.scale.set(.4,.4,.4);L.rotation.x=Math.PI*.75;const B=f.clone();B.position.set(-1,.1,2.6);B.scale.set(.15,.15,.15);B.rotation.x=Math.PI*.75;const D=f.clone();D.position.set(-1.5,.35,2.3);D.scale.set(.5,.5,.5);D.rotation.x=Math.PI*.75;i.add(f,L,B,D);const Ie=new de(1,0),Le=new w({map:A,normalMap:F,aoMap:v,roughnessMap:v,metalnessMap:v});for(let c=0;c<30;c++){const o=Math.random()*Math.PI*2,s=5.5+Math.random()*5,d=Math.sin(o)*s,oe=Math.cos(o)*s,r=new u(Ie,Le),H=Math.random()+.1;r.scale.setScalar(H),r.position.set(d,H*.2,oe),r.rotation.x=Math.random()-.5,r.rotation.y=Math.random()-.5,r.rotation.z=Math.random()-.5,r.castShadow=!0,r.receiveShadow=!0,Y.add(r)}const Be=new he("#86cdff",.175);i.add(Be);const a=new pe("#86cdff",1);a.position.set(3,2,-8);i.add(a);const $=new P("#ff7d46",1,7);$.position.set(0,2.2,2.5);k.add($);const M=new P("#ff0088",5,7),x=new P("#8800ff",5,7),b=new P("#ff0000",5,7);i.add(M,x,b);const n={width:window.innerWidth,height:window.innerHeight};window.addEventListener("resize",()=>{n.width=window.innerWidth,n.height=window.innerHeight,l.aspect=n.width/n.height,l.updateProjectionMatrix(),p.setSize(n.width,n.height),p.setPixelRatio(Math.min(window.devicePixelRatio,2))});const l=new ue(45,n.width/n.height,.1,100);l.position.x=4;l.position.y=2;l.position.z=5;i.add(l);const ee=new we(l,X);ee.enableDamping=!0;const p=new fe({canvas:X});p.setSize(n.width,n.height);p.setPixelRatio(Math.min(window.devicePixelRatio,2));p.shadowMap.enabled=!0;p.shadowMap.type=me;a.castShadow=!0;M.castShadow=!0;x.castShadow=!0;b.castShadow=!0;W.receiveShadow=!0;z.receiveShadow=!0;I.castShadow=!0;z.castShadow=!0;a.shadow.mapSize.width=256;a.shadow.mapSize.height=256;a.shadow.camera.top=8;a.shadow.camera.right=8;a.shadow.camera.bottom=-8;a.shadow.camera.left=-8;a.shadow.camera.near=1;a.shadow.camera.far=1;const m=new E;m.scale.setScalar(1e4);m.material.uniforms.turbidity.value=10;m.material.uniforms.rayleigh.value=3;m.material.uniforms.mieCoefficient.value=.1;m.material.uniforms.mieDirectionalG.value=.95;m.material.uniforms.sunPosition.value=new N(.3,-.038,-.95);i.add(m);i.fog=new _e("#02343f",.1);const U=new ve,te=()=>{U.update();const c=U.getElapsed(),o=c*.5;M.position.x=Math.cos(o)*7,M.position.z=Math.sin(o)*7,M.position.y=Math.sin(o)*Math.sin(o*2.34)*Math.sin(o*3.45);const s=-c*.38;x.position.x=Math.cos(s)*4,x.position.z=Math.sin(s)*4,x.position.y=Math.sin(s)*Math.sin(s*2.746)*Math.sin(s*4.785);const d=-c*.78;b.position.x=Math.cos(d)*8,b.position.z=Math.sin(d)*7.4,b.position.y=Math.sin(d)*Math.sin(d*2.746)*Math.sin(d*4.785),ee.update(),p.render(i,l),window.requestAnimationFrame(te)};te();
//# sourceMappingURL=lesson12-jLTfKfxc.js.map

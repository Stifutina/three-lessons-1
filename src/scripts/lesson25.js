import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from '../shaders/water/vertex.glsl'
import waterFragmentShader from '../shaders/water/fragment.glsl'
// import { Sky } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(10, 10, 680, 680)

// debugObject.depthColor = '#186691'; // 0000ff
// debugObject.surfaceColor = '#9db8ff'; // 8888ff
debugObject.depthColor = '#094058'; // 0000ff
debugObject.surfaceColor = '#36a9e7'; // 8888ff
debugObject.fogColor = '#7492be';

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ 'fog' ],
        {
            uBigWaveElevation: { value: 0.105 },
            uBigWaveFrequency: { value: new THREE.Vector2(4, 1.5) },
            uBigVawesSpeed: { value: 0.75 },
            time: { value: 0 },
            uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
            uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
            uColorOffset: { value: 0.08 },
            uColorMultiplier: { value: 1.2 },
            uSmallWaveElevation: { value: 0.09 },
            uSmallWaveFrequency: { value: 3.0 },
            uSmallVawesSpeed: { value: 0.2 },
            uSmallWaveIterations: { value: 4.0 },
    }]),
    // blending: THREE.NoBlending,
    fog: true,
    transparent: true,
});


// Debug
gui.add(waterMaterial.uniforms.uBigWaveElevation, 'value').min(0).max(1).step(0.001).name('uBigWaveElevation');
gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWaveFrequencyX');
gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWaveFrequencyY');
gui.add(waterMaterial.uniforms.uBigVawesSpeed, 'value').min(0).max(5).step(0.001).name('uBigVawesSpeed');
gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');
gui.add(waterMaterial.uniforms.uSmallWaveElevation, 'value').min(0).max(1).step(0.001).name('uSmallWaveElevation');
gui.add(waterMaterial.uniforms.uSmallWaveFrequency, 'value').min(0).max(20).step(0.001).name('uSmallWaveFrequency');
gui.add(waterMaterial.uniforms.uSmallVawesSpeed, 'value').min(0).max(5).step(0.001).name('uSmallVawesSpeed');
gui.add(waterMaterial.uniforms.uSmallWaveIterations, 'value').min(1).max(5).step(1).name('uSmallWaveIterations');
gui.addColor(debugObject, 'depthColor').onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
}).name('uDepthColor');
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
}).name('uSurfaceColor');


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water);



/**
 * Fog
 */

scene.fog = new THREE.FogExp2( debugObject.fogColor, 0.27 );
scene.background = new THREE.Color( debugObject.fogColor );


gui.add(scene.fog, 'density').min(0).max(2).step(0.001).name('fogDensity');
gui.addColor(debugObject, 'fogColor').onChange(() => {
    scene.fog.color.set(debugObject.fogColor);
    scene.background.set(debugObject.fogColor);
}).name('fogColor');



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    waterMaterial.uniforms.time.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
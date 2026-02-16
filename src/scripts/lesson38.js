import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui'
import particlesVertexShader from '/shaders/flow-field-particles/particles/vertex.glsl'
import particlesFragmentShader from '/shaders/flow-field-particles/particles/fragment.glsl'
import gpgpuParticles from '/shaders/flow-field-particles/gpgpu/particles.glsl'


/**
 * GPGPU stands for General-Purpose computing on Graphic Processing Units
 * A way of using the GPU to process data rather than rendering pixels for the end-user.
 * Great for when you need to do the same complex caluclation thousands of times.
 * 
 * Flow field - corresponds to spatialized streams. For any point in space we calculate a direction
 * 
 * FBOs - are the textures in which we save the renders instead of doing it on the canvas. 
 * We'll use FBO instead position attribute vertex shader.
 * 
 * 
 * So we need to create GPGPU here
 * 
 * GPUComputationRenderer.js
 */


/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4.5, 4, 11)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#29191f'
renderer.setClearColor(debugObject.clearColor)







///////////// MAIN LOGIC ///////////////

const gltf = await gltfLoader.loadAsync('/flow-field/model.glb');



/**
 * Base geometry
 */

const baseGeometry = {};

// baseGeometry.instance = new THREE.TorusGeometry(3, 3, 16, 26);
baseGeometry.instance = gltf.scene.children[0].geometry;
baseGeometry.count = baseGeometry.instance.attributes.position.count;

// Between the base geometry instantiation and particles points
// we will instantiate the GPUComputationRenderer

/**
 * GPU Compute
 */
//Setup
const gpgpu = {}

gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer); // offscreen rendering

// Base particles
const baseParticlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
    const i3 = i * 3;
    const i4 = i * 4;
    
    // position based on geometry
    baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0];
    baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1];
    baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2];
    baseParticlesTexture.image.data[i4 + 3] = Math.random();
}

// In a shader we'll explain how to update each pixel (particles.glsl)
// Particles variable (access to a material):
gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticles, baseParticlesTexture);
// <-- Here baseParticlesTexture will be injected in gpgpuParticles shader 
// and the name of this will be uParticles

// The "variable" needs to be re-injected to itself and we can use the setVariableDependencies() method
// the first parameter is the "variable" - gpgpu.particlesVariable, and the second parameter is an array 
// containing the dependencies (the same gpgpu.particlesVariable)

gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable]); 
// <-- LOOP: the output of this variable will be sent to the next compute again and again

// Uniforms
gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture); // initial positions
gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5);

// Init
gpgpu.computation.init();

// Debug
const gpgpuParticlesTexture = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

gpgpu.debug = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshBasicMaterial({
        map: gpgpuParticlesTexture
    })
)
gpgpu.debug.position.x = 3;
scene.add(gpgpu.debug);

gpgpu.debug.visible = false;







/**
 * Particles
 */
const particles = {}

//Geometry
const particlesUVArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y ++) {
    for (let x = 0; x < gpgpu.size; x++) {
        const i = (y * gpgpu.size) + x;
        const i2 = i * 2;
        
        const uvX = (x + 0.5) / gpgpu.size;
        const uvY = (y + 0.5) / gpgpu.size; // normalize

        particlesUVArray[i2] = uvX;
        particlesUVArray[i2 + 1] = uvY;


        // Particle size
        sizesArray[i] = Math.random();
    }
}

particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count); // define range of vertices
particles.geometry.setAttribute('aParticlesUV', new THREE.BufferAttribute(particlesUVArray, 2));
particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color);
particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1));

// Material
particles.material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uSize: new THREE.Uniform(0.12),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uParticlesTexture: new THREE.Uniform()
    },
    // blendColor: THREE.AddOperation
})

// Points
particles.points = new THREE.Points(particles.geometry, particles.material)
scene.add(particles.points)

/**
 * Tweaks
 */
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
gui.add(particles.material.uniforms.uSize, 'value').min(0).max(0.5).step(0.001).name('uSize');
gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value').min(0).max(1).name('uFlowFieldInfluence');
gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value').min(0).max(2).name('uFlowFieldStrength');
gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value').min(0).max(1).step(0.001).name('uFlowFieldFrequency');

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // Update controls
    controls.update()

    // Send time to a paticles.glsl
    gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
    gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;

    // GPGPU update
    gpgpu.computation.compute();

    // ping-pong computation. we need to apply the last one
    particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
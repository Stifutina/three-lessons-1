import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import coffeeSmokeVertextShader from '../shaders/coffee_smoke/vertex.glsl';
import coffeeSmokeFragmentShader from '../shaders/coffee_smoke/fragment.glsl';

/**
 * Perlin Noise Smoke
 * 
 * Generate textures:
 * http://kitfox.com/projects/perlinNoiseMaker/
 * https://opengameart.org/content/noise-texture-pack
 * https://mebiusbox.github.io/contents/EffectTextureMaker/
 */


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 8
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
gltfLoader.load(
    '/models/bakedModel.glb',
    (gltf) =>
    {
        gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(gltf.scene)
    }
)

/**
 * Smoke mesh
 */
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);

smokeGeometry.translate(0, 0.8, 0);
smokeGeometry.scale(1.5, 6, 1.5);

const perlinTexture = textureLoader.load('/textures/perlin.png');

perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

const smokeMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    vertexShader: coffeeSmokeVertextShader,
    fragmentShader: coffeeSmokeFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    }
});
const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);

scene.add(smokeMesh);


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update smoke material
    smokeMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
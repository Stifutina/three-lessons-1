import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import holographicVertexShader from '/shaders/holographic/vertex.glsl';
import holographicFragmentShader from '/shaders/holographic/fragment.glsl';


/**
 * Holographic Effect
 * 
 * 
 * Fresnel is used a lot even though we barely notice it. 
 * It’s used to create cool effects like we are doing right now, but it’s also used for 
 * physically accurate rendering when handling reflection because a surface is more 
 * reflective when seen at an narrow angle. You can witness that when watching the 
 * surface of a lake. When seen from above, you can see the rocks and fishes in the water. 
 * But when seen at a narrow angle, you can’t see what’s in the water because of the reflection.

    https://www.racoon-artworks.de/cgbasics/fresnel.php
    https://www.dorian-iten.com/fresnel/
    https://shanesimmsart.wordpress.com/2022/03/29/fresnel-reflection/
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
camera.position.set(7, 7, 7)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
const materialParameters = {}
materialParameters.color = '#5c7ec1' // Green color
rendererParameters.clearColor = '#1d1f2a' 

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(rendererParameters.clearColor)
    })

gui.addColor(materialParameters, 'color')
    .name('Color')
    .onChange(() =>
    {
        material.uniforms.uColor.value.set(materialParameters.color)
    })

/**
 * Material
 */
const material = new THREE.ShaderMaterial();

material.vertexShader = holographicVertexShader;
material.fragmentShader = holographicFragmentShader;
material.uniforms = {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)), // Green color
}
material.transparent = true;
material.side = THREE.DoubleSide;
material.depthWrite = false; // Disable depth writing to allow for transparency effects
material.blending = THREE.AdditiveBlending;


/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
    '/models/suzanne.glb',
    (gltf) =>
    {
        suzanne = gltf.scene
        suzanne.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
        })
        scene.add(suzanne)
    }
)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material uniforms
    material.uniforms.uTime.value = elapsedTime

    // Rotate objects
    if(suzanne)
    {
        suzanne.rotation.x = - elapsedTime * 0.1
        suzanne.rotation.y = elapsedTime * 0.2
    }

    sphere.rotation.x = - elapsedTime * 0.1
    sphere.rotation.y = elapsedTime * 0.2

    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
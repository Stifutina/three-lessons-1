import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */

/** Ambient Light
 * Reflection of light off of surfaces
 * comes from all directions, NO SHADOWS
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // comes from all directions, NO SHADOWS

scene.add(ambientLight);
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('Ambient Light Intensity');

/** Directional Light
 * Light that comes from a specific direction
 * by default, it comes from the top-left corner
 */
const directionalLight = new THREE.DirectionalLight(0x00fffc, 1);

directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name('Directional Light Intensity');


/** Hemisphere Light
 * Gradient light between two colors
 * comes from every direction like ambient light
 */
const hemisphereLight = new THREE.HemisphereLight(0xf00000, 0x0f00ff, 1);

gui.add(hemisphereLight, 'intensity').min(0).max(3).step(0.001).name('Hemisphere Light Intensity');
scene.add(hemisphereLight);

/** Point Light
 * Light that comes from a specific point
 * ...like a light bulb
 * 
 * Distance: how far the light will go
 * Decay: how fast the light will decay; Sharpness of the light
 */
const pointLight = new THREE.PointLight(0xff9000, 2, 10, 2);

pointLight.position.set(0, 0.5, 1);
gui.add(pointLight, 'intensity').min(0).max(3).step(0.001).name('Point Light Intensity');
gui.add(pointLight, 'distance').min(0).max(10).step(0.01).name('Point Light Distance');
gui.add(pointLight, 'decay').min(0).max(10).step(0.01).name('Point Light Decay');
scene.add(pointLight);


/** RectArea Light 
 * Light that comes from a specific rectangle
 * works only with MeshStandardMaterial and MeshPhysicalMaterial
 */
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);

gui.add(rectAreaLight, 'intensity').min(0).max(10).step(0.001).name('RectArea Light Intensity');
scene.add(rectAreaLight);

/**
 * To position the RectArea Light in the scene
 * we need to set it lookAt() a point
 */
rectAreaLight.position.set(-1.5, 0, 1.5); // first set the position
rectAreaLight.lookAt(new THREE.Vector3()); // then set the lookAt() point

/** Spot Light
 * Light that comes from a specific direction
 * angle - the width of the light beam
 * penumbra - the softness of the light beam
 * decay - how fast the light will decay; Sharpness of the light
 * ...like a flashlight */
const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 6, Math.PI * 0.1, 0.25, 1);

spotLight.position.set(0, 2, 3);
scene.add(spotLight);

// spot light target is object that the light is looking at, but it's not present at the scene
// so we need to add it to the scene if we want to handle and make it work
scene.add(spotLight.target);
spotLight.target.position.x = -1.5;

gui.add(spotLight, 'intensity').min(0).max(10).step(0.001).name('Spot Light Intensity');

/**
 * Minimal perfomance cost is Hemisphere Light and Ambient Light
 * Highest perfomance cost is Spot Light and RectArea Light
 */


/**
 * We need helpers. When you create the light, you don't see it in the scene. You can see it only when it hits the object,
 * the effect of the light on the object. So we need to create helpers to see the light in the scene.
 */


/** Hemisphere Light Helper */
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);

scene.add(hemisphereLightHelper);

/** Directional Light Helper */
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);

scene.add(directionalLightHelper);

/** Point Light Helper */
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);

scene.add(pointLightHelper);

/** Spot Light Helper */
const spotLightHelper = new THREE.SpotLightHelper(spotLight);

scene.add(spotLightHelper);

window.requestAnimationFrame(() => {
    spotLightHelper.update();
});

/** RectArea Light Helper */
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);





/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65;
plane.material.side = THREE.DoubleSide;

scene.add(sphere, cube, torus, plane);

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
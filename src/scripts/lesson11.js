import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

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
 * Cast shadows Only 
 *  PointLight, 
 *  DirectionalLight and 
 *  SpotLight
 * 
 * to get shadow we need to 
 * 1. set castShadow = true on light
 * 2. set receiveShadow = true on object
 * 3. enable shadowMap on renderer
 * 4. enable castShadow on object
 * 
 * we can also set shadow map size to get better quality
 * shadow map available in directionalLight.shadow
 */

// Ambient light, just to see the objects
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)



// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

directionalLight.castShadow = false; // say light to cast shadow
directionalLight.visible = false;

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

// Directional light uses Orthographic camera to render shadow map, so we can use CameraHelper to visualize it
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = - 2;
directionalLight.shadow.camera.left = - 2;
directionalLight.shadow.camera.right = 2;

directionalLight.shadow.radius = 10; // not working with THREE.PCFSoftShadowMap

scene.add(directionalLightCameraHelper);

directionalLightCameraHelper.visible = false;




// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 10, 10, Math.PI * 0.3);

// spotLight.castShadow = true;
scene.add(spotLight);

spotLight.position.set(0, 2, 2);

// Spot light uses Perspective camera to render shadow map, so we can use CameraHelper to visualize it
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);

scene.add(spotLightCameraHelper);

spotLightCameraHelper.visible = false;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.castShadow = false;
spotLight.visible = false;

/**
 * Need to set near and far correctly to optimize performance
 */
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;
/**
 * In the latest versions of Three.js, the fov cannot be changed and will always be overridden by the angle of the SpotLight.
 */
spotLight.shadow.camera.fov = 30; // not working



// Point light
const pointLight = new THREE.PointLight(0xffffff, 4)

pointLight.castShadow = false;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;

pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

pointLight.position.set(0, 2, 2);

scene.add(pointLight);

// Point light uses Perspective camera to render shadow map, so we can use CameraHelper to visualize it
// it renders shadow map in all 6 directions, like an environment cube. The last looking down, that's why camera looks down
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
scene.add(pointLightCameraHelper);

// pointLight.visible = false;
pointLightCameraHelper.visible = false;


/**
 * Use baked shadow texture to optimize performance
 */
//Textures used as map and matcap are supposed to be encoded in sRGB.
//In the latest versions of Three.js we need to specify it by setting their colorSpace to THREE.SRGBColorSpace
const textureLoader = new THREE.TextureLoader();
const bakedShadowTexture = textureLoader.load('/textures/bakedShadow.jpg');
const simpleShadowTexture = textureLoader.load('/textures/simpleShadow.jpg');

bakedShadowTexture.colorSpace = THREE.SRGBColorSpace;


/**
 * Materials
 */
const materialPlane = new THREE.MeshStandardMaterial();
const materialSphere = new THREE.MeshStandardMaterial();

const bakedShadowMaterial = new THREE.MeshBasicMaterial({ map: bakedShadowTexture }); // use for baked shadow

materialPlane.roughness = 0.7

gui.add(materialPlane, 'metalness').min(0).max(1).step(0.001)
gui.add(materialPlane, 'roughness').min(0).max(1).step(0.001);

materialSphere.color = new THREE.Color('yellow');

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    materialSphere
);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    materialPlane
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
sphere.castShadow = true;
plane.receiveShadow = true;

scene.add(sphere, plane);

/**
 * Make simple baked shadows
 */
const bakedShadowSphere = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        alphaMap: simpleShadowTexture,
        transparent: true
    })
);

bakedShadowSphere.rotation.x = - Math.PI * 0.5;
bakedShadowSphere.position.y = plane.position.y + 0.01;

scene.add(bakedShadowSphere);



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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true; // say renderer to handle shadow maps

/**
 * Shadow map algorithms
 * THREE.BasicShadowMap very perfomant but low quality
 * THREE.PCFShadowMap less performant but smoother edges
 * THREE.PCFSoftShadowMap less performant but even softer edges
 * THREE.VSMShadowMap less performant, more constraints, can have unexpected results
 */
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate ball
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));
    // Update shadow
    bakedShadowSphere.position.x = sphere.position.x;
    bakedShadowSphere.position.z = sphere.position.z;
    bakedShadowSphere.material.opacity = (1 - sphere.position.y) * 0.3;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
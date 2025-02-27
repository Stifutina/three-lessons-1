import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

// REALISTIC RENDER



/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()

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
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh)
        {
            child.castShadow = true;
            child.receiveShadow = true;
            // child.materal.environmentMapIntensity = scene.environmentIntensity;
            // child.materal.environmentMap = scene.environment;

            // Activate shadow here
        }
    })
}

/**
 * Environment map
 */
// Intensity
scene.environmentIntensity = 1
gui
    .add(scene, 'environmentIntensity')
    .min(0)
    .max(10)
    .step(0.001)

// HDR (RGBE) equirectangular
rgbeLoader.load('/models/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
});

/**
 * ENV Maps can't cast shadows. 
 * So we need to create normal 
 * light source to cast shadows in a scene
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.position.set(-6, 8.5, 2.5)
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 25;
directionalLight.shadow.mapSize.set(256, 256);

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001);
gui.add(directionalLight.position, 'x').min(-15).max(15).step(0.001);
gui.add(directionalLight.position, 'y').min(-15).max(15).step(0.001);
gui.add(directionalLight.position, 'z').min(-15).max(15).step(0.001);
gui.add(directionalLight, 'castShadow');

// chair model casts shadow on itself, that's why we see some stipes on the mesh surface
// to fix this we need to tweak shadow.bias
directionalLight.shadow.bias = -0.004; // 1. Set bias to get rid of stripes, but it will create some gaps on shadows, so tweak it
directionalLight.shadow.normalBias = 0.027; // 2. And then tweak the normalBias to get rid of gaps

gui.add(directionalLight.shadow, 'normalBias').min(-1).max(1).step(0.0001);
gui.add(directionalLight.shadow, 'bias').min(-1).max(1).step(0.0001);

scene.add(directionalLight);

// Helper
const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

// Target
directionalLight.target.position.set(0, 4, 0);
directionalLight.target.updateMatrixWorld(); // otherwise the target is not updated

// scene.add(directionalLightHelper);



/**
 * Models
 */
// Helmet
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(10, 10, 10)
//         scene.add(gltf.scene)

//         updateAllMaterials()
//     }
// )

gltfLoader.load(
    '/models/chair.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.01, 0.01, 0.01);
        gltf.scene.rotation.y = - Math.PI * 0.5;
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)



/**
 * Floor
 */
const floorColorTexture = textureLoader.load('/textures/wall/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg');
const floorARMTexture = textureLoader.load('/textures/wall/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg');
const floorNormalTexture = textureLoader.load('/textures/wall/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png');

floorColorTexture.colorSpace = THREE.SRGBColorSpace; // !! IMPORTANT to adapt the image to eye sensitivity

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture
    })
);
floor.rotation.x = - Math.PI * 0.5;

floor.position.z = 5;

scene.add(floor);
/**
 * Wall
 */
const wallColorTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');
const wallARMTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');
const wallNormalTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');

wallColorTexture.colorSpace = THREE.SRGBColorSpace; // !! IMPORTANT to adapt the image to eye sensitivity

const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    })
);

wall.position.z = -5;
wall.position.y = 10;

scene.add(wall);




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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true // !! IMPORTANT !! to get rid of pixelated edges effect
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// SHOW Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


// Tone mapping
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2;

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

/** 
 * !! IMPORTANT !!
 * Antialiasing - is a technique used in digital images to reduce visual defects.
 * For example, when you zoom in on a digital image, you may notice that the edges of objects appear jagged or pixelated.
 * This is called aliasing, and it occurs because the image is made up of discrete pixels.
 */


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
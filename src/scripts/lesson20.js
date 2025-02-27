import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { EXRLoader } from 'three/examples/jsm/Addons.js' // EXR supports layers and alpha channels
import { GroundedSkybox } from 'three/examples/jsm/Addons.js'

/**
 * BLENDER. ENV MAPS
 * 
    There are tons of great online tutorials, and most of them are free. Here's a non-exhaustive list of ressources you can use:
    Blender Youtube Channel: https://www.youtube.com/user/BlenderFoundation
    Blender Guru Youtube Channel: https://www.youtube.com/channel/UCOKHwx1VCdgnxwbjyb9Iu1g
    Grant Abbitt Youtube Channel: https://www.youtube.com/channel/UCZFUrFoqvqlN8seaAeEwjlw
    CGFastTrack: https://www.youtube.com/c/CGFastTrack/videos
    CGCookie: https://cgcookie.com/
 * 
 */

/**
 * environment maps taken from the HDRI section of https://polyhaven.com 
 * and they have been converted to cube textures using https://matheowis.github.io/HDRI-to-CubeMap/.
 */

/**
 * Generate ENV Maps with
 * Blender or
 * https://theresanaiforthat.com/@evanleslor/360-image-generator/
 * or Nvidia Canvas
 */


/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const exrLoader = new EXRLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) =>
    {
        console.log('success', gltf)
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene)
    },
    (progress) =>
    {
        console.log('progress')
        console.log(progress)
    },
    (error) =>
    {
        console.log('error')
        console.log(error)
    }
)


/**
 * Environment map variations:
 */
let skybox;

scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001).name('Environment Intensity');
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001).name('Background Blurriness');
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001).name('Background Intensity');

gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('Background Rotation Y');
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('Environment Rotation Y');


/** 1. Cube Environment (6 images) */
const cubeTexture = cubeTextureLoader.load([
    '/models/environmentMaps/2/px.png',
    '/models/environmentMaps/2/nx.png',
    '/models/environmentMaps/2/py.png',
    '/models/environmentMaps/2/ny.png',
    '/models/environmentMaps/2/pz.png',
    '/models/environmentMaps/2/nz.png'
]);

// Scene environment sets lighting and reflections
// Scene background sets the background of the scene

// scene.background = cubeTexture
// scene.environment = cubeTexture; /** << !!! 1. ENV MAP TO MAKE WORKING REFLECTIONS FOR PBR MATERIALS */

/** 2. HDR Environment / + Skybox */
rgbeLoader.load('/models/environmentMaps/2/2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping; /** !!! << Important to ENV Data Texture */

    // scene.environment = envMap; // hdr image is better than cube texture
    // scene.background = envMap;
    // torusKnot.material.envMap = envMap; // only for mesh basic material

    /**
     * SKYBOX
     * We need a way to show ENV like a real floor and env around the scene
     * we can do this using rgbe loaded texture and Grounded SkyBox !!! <<< Important
     */
    // scene.environment = envMap;


    // skybox = new GroundedSkybox(envMap, 15, 80); // height, radius

    // skybox.position.y = 15; // to make it grounded
    // scene.add(skybox);
});

/** 3. EXR Environment */
exrLoader.load('/models/environmentMaps/nvidiaCanvas-4k.exr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping; /** !!! << Important to ENV Data Texture */

    // scene.environment = envMap;
    // scene.background = envMap;
    // torusKnot.material.envMap = envMap;
});

/** 4. LDR WEBP/JPG/PNG Image */
textureLoader.load('/environmentMaps/panorama.png', (envTexture) => {
    envTexture.mapping = THREE.EquirectangularReflectionMapping; /** !!! << Important to ENV Data Texture */

    envTexture.colorSpace = THREE.SRGBColorSpace; /** !!! Important to set correct color space to get correct color */

    // scene.environment = envTexture;
    // scene.background = envTexture;
    // torusKnot.material.envMap = envTexture;
});


/**
 * Real time environment map
 */
const envTexture = textureLoader.load('/models/environmentMaps/blockadesLabsSkybox/digital_painting_neon_city_night_orange_lights_.jpg');

envTexture.mapping = THREE.EquirectangularReflectionMapping; /** !!! << Important to ENV Data Texture */
envTexture.colorSpace = THREE.SRGBColorSpace;

scene.background = envTexture;

const donutLight = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(20, 8, 17) })
);

donutLight.layers.set(1); // only visible to cubeCamera !! <<<
donutLight.layers.enable(1);
donutLight.position.y = 3;

scene.add(donutLight);

// Get renders from render target 
// put it into cubeRenderTarget 
// and use it's texture as env map
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
    256,
    {
        type: THREE.FloatType, // or FloatType
        
    }
);

scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

cubeCamera.layers.set(1); // this camera should see only the donutLight







/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
)
torusKnot.position.x = - 4
torusKnot.position.y = 4
scene.add(torusKnot)


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
    // Time
    const elapsedTime = clock.getElapsedTime();


    // Real time env map
    if (donutLight) {
        donutLight.rotation.x = Math.sin(elapsedTime) * 2;

        cubeCamera.update(renderer, scene);
    }
    


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
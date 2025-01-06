import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { Sky } from 'three/examples/jsm/Addons.js'

// Finding textures is always hard and doing a web search doesn’t always 
// highlight the best places. That’s why I’ve created a Notion page gathering 
// some of my favorite assets libraries: 
// https://www.notion.so/brunosimon/Assets-953f65558015455eb65d38a7a5db7171?pvs=4


/**
 * 
 * 
Squoosh: One file at a time, a lot of options, live preview
CloudConvert: Multiple files at a time, 25 images daily with a user account, some options
TinyPNG: Multiple files at a time, limited but you can just wait for a while, no option
And there are many local solutions, NPM libraries, extensions, etc.:

https://sharp.pixelplumbing.com
https://compressx.app
https://file-converter.io
https://optimage.app
https://apps.apple.com/gb/app/pym/id1451733095
 * 
 * 
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


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const skyTexture = textureLoader.load('/textures/environmentMap/2k.hdr');

// Floor
const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.webp');
const floorColorTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp');
const floorDisplacementTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp');
const floorNormalTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp');
const floorARMTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp');

floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.repeat.set(8, 8);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.repeat.set(8, 8);
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.repeat.set(8, 8);

floorColorTexture.colorSpace = THREE.SRGBColorSpace;


// Walls
const wallsColorTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');
const wallsNormalTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');
const wallsARMTexture = textureLoader.load('/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');

wallsColorTexture.colorSpace = THREE.SRGBColorSpace;


// Roof
const roofColorTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp');
const roofARMTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp');
const roofNormalTexture = textureLoader.load('/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp');

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(2.4, 1);
roofARMTexture.repeat.set(2.4, 1);
roofNormalTexture.repeat.set(2.4, 1);
roofColorTexture.wrapS = THREE.RepeatWrapping;
roofARMTexture.wrapS = THREE.RepeatWrapping;
roofNormalTexture.wrapS = THREE.RepeatWrapping;
roofColorTexture.wrapT = THREE.RepeatWrapping;
roofARMTexture.wrapT = THREE.RepeatWrapping;
roofNormalTexture.wrapT = THREE.RepeatWrapping;


// Bushes
const bushColorTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp');
const bushNormalTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp');
const bushARMTexture = textureLoader.load('/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp');

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

// Stones
const stoneColorTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp');
const stoneNormalTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp');
const stoneARMTexture = textureLoader.load('/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp');

stoneColorTexture.colorSpace = THREE.SRGBColorSpace;

stoneColorTexture.wrapS = THREE.RepeatWrapping;
stoneARMTexture.wrapS = THREE.RepeatWrapping;
stoneNormalTexture.wrapS = THREE.RepeatWrapping;
stoneColorTexture.wrapT = THREE.RepeatWrapping;
stoneARMTexture.wrapT = THREE.RepeatWrapping;
stoneNormalTexture.wrapT = THREE.RepeatWrapping;


// Door
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');




/**
 * House
 */
// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30, 200, 200),
    new THREE.MeshStandardMaterial({ 
        alphaMap: floorAlphaTexture, 
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2, // to prevent moving the floor up because of too light texture
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        transparent: true 
    })
);

floor.rotation.x = - Math.PI * 0.5;

scene.add(floor);

// Group
const house = new THREE.Group();
const stones = new THREE.Group();

scene.add(house, stones);

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({ 
        map: wallsColorTexture,
        normalMap: wallsNormalTexture,
        aoMap: wallsARMTexture,
        roughnessMap: wallsARMTexture,
        metalnessMap: wallsARMTexture
    })
);

walls.position.y = 1.25;
house.add(walls);


// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.8, 4),
    new THREE.MeshStandardMaterial({ 
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
);

// Set correct rotation for pyramid geometry texture and prevent skewing
roofColorTexture.rotation = Math.PI * - 0.04;
roofARMTexture.rotation = Math.PI * - 0.04;
roofNormalTexture.rotation = Math.PI * - 0.04;


roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.5 + 0.75;
house.add(roof);


// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 80, 80),
    new THREE.MeshStandardMaterial({
        alphaMap: doorAlphaTexture,
        map: doorColorTexture,
        normalMap: doorNormalTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
        aoMap: doorAmbientOcclusionTexture,
        transparent: true
    })
);

door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ 
    map: bushColorTexture,
    normalMap: bushNormalTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    color: '#ccffcc'
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.3, 2.3);
bush1.rotation.x = Math.PI * 0.75;

const bush2 = bush1.clone();
bush2.position.set(1.5, 0.2, 2.4);
bush2.scale.set(0.4, 0.4, 0.4);
bush2.rotation.x = Math.PI * 0.75;

const bush3 = bush1.clone();
bush3.position.set(-1, 0.1, 2.6);
bush3.scale.set(0.15, 0.15, 0.15);
bush3.rotation.x = Math.PI * 0.75;

const bush4 = bush1.clone();
bush4.position.set(-1.5, 0.35, 2.3);
bush4.scale.set(0.5, 0.5, 0.5);
bush4.rotation.x = Math.PI * 0.75;

scene.add(bush1, bush2, bush3, bush4);

// Stones
const stoneGeometry = new THREE.DodecahedronGeometry(1, 0);
const stonesMaterial = new THREE.MeshStandardMaterial({
    map: stoneColorTexture,
    normalMap: stoneNormalTexture,
    aoMap: stoneARMTexture,
    roughnessMap: stoneARMTexture,
    metalnessMap: stoneARMTexture,
})

for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5.5 + Math.random() * 5;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const stone = new THREE.Mesh(stoneGeometry, stonesMaterial);
    const size = Math.random() + 0.1;
    
    stone.scale.setScalar(size);
    stone.position.set(x, size * 0.2, z);
    stone.rotation.x = (Math.random() - 0.5);
    stone.rotation.y = (Math.random() - 0.5);
    stone.rotation.z = (Math.random() - 0.5);

    stone.castShadow = true;
    stone.receiveShadow = true;

    stones.add(stone);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.175)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);


/**
 * Flying lights
 */
const light1 = new THREE.PointLight('#ff0088', 5, 7);
const light2 = new THREE.PointLight('#8800ff', 5, 7);
const light3 = new THREE.PointLight('#ff0000', 5, 7);

scene.add(light1, light2, light3);


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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cast and receive
directionalLight.castShadow = true;
light1.castShadow = true;
light2.castShadow = true;
light3.castShadow = true;

floor.receiveShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
walls.castShadow = true;

// Mapping
directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = - 8;
directionalLight.shadow.camera.left = - 8;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 1;


/** Sky */
const sky = new Sky();

sky.scale.setScalar(10000);

sky.material.uniforms.turbidity.value = 10;
sky.material.uniforms.rayleigh.value = 3;
sky.material.uniforms.mieCoefficient.value = 0.1;
sky.material.uniforms.mieDirectionalG.value = 0.95;
sky.material.uniforms.sunPosition.value = new THREE.Vector3(0.3, -0.038, -0.95);

scene.add(sky);

/**
 * Fog
 */
// scene.fog = new THREE.Fog('#262837', 1, 15);
scene.fog = new THREE.FogExp2('#02343f', 0.1);



/**
 * Animate
 */
const timer = new Timer()

//You can test that easily and find frequencies that look unpredictable 
//using mathematic formulas and visualisation tools such as the Desmos Calculator.
// https://www.desmos.com/calculator
const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed();

    // Update flying lights
    const lightAngle1 = elapsedTime * 0.5;

    light1.position.x = Math.cos(lightAngle1) * 7;
    light1.position.z = Math.sin(lightAngle1) * 7;
    light1.position.y = Math.sin(lightAngle1) * Math.sin(lightAngle1 * 2.34) * Math.sin(lightAngle1 * 3.45);

    const lightAngle2 = - elapsedTime * 0.38;

    light2.position.x = Math.cos(lightAngle2) * 4;
    light2.position.z = Math.sin(lightAngle2) * 4;
    light2.position.y = Math.sin(lightAngle2) * Math.sin(lightAngle2 * 2.746) * Math.sin(lightAngle2 * 4.785);
    
    const lightAngle3 = - elapsedTime * 0.78;

    light3.position.x = Math.cos(lightAngle3) * 8;
    light3.position.z = Math.sin(lightAngle3) * 7.4;
    light3.position.y = Math.sin(lightAngle3) * Math.sin(lightAngle3 * 2.746) * Math.sin(lightAngle3 * 4.785);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
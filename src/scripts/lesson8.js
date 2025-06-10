import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/Addons.js';


// https://gero3.github.io/facetype.js/

/** GUI Debug */
const gui = new GUI({
    title: 'Global Controls',
    width: 320
});
const globaGUIParams = {
    sheenColor: new THREE.Color(0xff0000)
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/** ENV Map */
const rgbeLoader = new RGBELoader();

rgbeLoader.load('/textures/environmentMap/2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envMap;
    scene.environment = envMap;
});

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
camera.position.x = 0
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

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const doorColor = textureLoader.load('/textures/door/color.jpg');
const doorAlpha = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusion = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeight = textureLoader.load('/textures/door/height.jpg');
const doorMetalness = textureLoader.load('/textures/door/metalness.jpg');
const doorNormal = textureLoader.load('/textures/door/normal.jpg');
const doorRoughness = textureLoader.load('/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('/textures/matcaps/8.png');
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');

gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

doorColor.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 * Shader - an algorithm that decides how the each pixel should look like
 */

/** Mesh basic material */
const material = new THREE.MeshBasicMaterial();

material.map = doorColor;
material.color = new THREE.Color(0x00ff00);
material.transparent = true; // should be set to true to see the alpha map
material.opacity = 0.5;
// material.alphaMap = doorAlpha;
material.side = THREE.DoubleSide; // to see the back side of the object

/** Normal material */
const normalMaterial = new THREE.MeshNormalMaterial(); // normal material can be used to debug the normals of the object

/** Matcap material - the super nice an realistic */
/** if camera and lights will not move, it's the best option */
const matcapMaterial = new THREE.MeshMatcapMaterial();
matcapMaterial.matcap = matcapTexture;
matcapMaterial.flatShading = true;

/** Depth material */
const depthMaterial = new THREE.MeshDepthMaterial();

/** Lambert material */
/** supports same properties as MeshBasicMaterial and also properties for lights handle */
/** but it's the first material which requires lights */
/** Best for Performance */
const lambertMaterial = new THREE.MeshLambertMaterial();

/** Phong material */
/** best than Lambert. Less performance but looks better, without glitches */
const phongMaterial = new THREE.MeshPhongMaterial();
phongMaterial.shininess = 100;
phongMaterial.specular = new THREE.Color(0x1188ff); // color of the reflection


/** Toon material */
/** similar to Phong material but with a cartoon effect */
// requires color for shadow and color for light
const toonMaterial = new THREE.MeshToonMaterial();
toonMaterial.gradientMap = gradientTexture;


/** Standard material */
/** the best material for most cases */
/** uses PBR */
/** supports lights but with a more realistic algorithm and better parameters like roughness and metalness */
const standardMaterial = new THREE.MeshStandardMaterial();
standardMaterial.metalness = 1;
standardMaterial.roughness = 1;

standardMaterial.map = doorColor;
standardMaterial.aoMap = doorAmbientOcclusion;
standardMaterial.aoMapIntensity = 1;
standardMaterial.displacementMap = doorHeight;
standardMaterial.displacementScale = 0.1;
standardMaterial.metalnessMap = doorMetalness;
standardMaterial.roughnessMap = doorRoughness;
standardMaterial.normalMap = doorNormal;

gui.add(standardMaterial, 'metalness').min(0).max(1).step(0.0001);
gui.add(standardMaterial, 'roughness').min(0).max(1).step(0.0001);
// standardMaterial.flatShading = true;


/** Physical material */
/** Duplicates Standard material props but has additionaly more realistic parameters */
/** Super realistic but takes a lot performance */
const physicalMaterial = new THREE.MeshPhysicalMaterial();

physicalMaterial.metalness = 1;
physicalMaterial.roughness = 1;

physicalMaterial.map = doorColor;
physicalMaterial.aoMap = doorAmbientOcclusion;
physicalMaterial.aoMapIntensity = 1;
physicalMaterial.displacementMap = doorHeight;
physicalMaterial.displacementScale = 0.1;
physicalMaterial.metalnessMap = doorMetalness;
physicalMaterial.roughnessMap = doorRoughness;
physicalMaterial.normalMap = doorNormal;

/** Clearcoat - is a layer of clearcoat on top of the material. Like a glass layer with its own properties */
// physicalMaterial.clearcoat = 1;
// physicalMaterial.clearcoatRoughness = 0;

// gui.add(physicalMaterial, 'clearcoat').min(0).max(1).step(0.0001);
// gui.add(physicalMaterial, 'clearcoatRoughness').min(0).max(1).step(0.0001);

/** Sheen - highlights material when seen from a narrow angle. Usually on fluffy materials like fabrics. */

// gui.add(physicalMaterial, 'sheen').min(0).max(1).step(0.0001);
// gui.add(physicalMaterial, 'sheenRoughness').min(0).max(1).step(0.0001);

// physicalMaterial.sheen = 1;
// physicalMaterial.sheenRoughness = 0.25;

// gui.addColor(globaGUIParams, 'sheenColor').onChange(() => { physicalMaterial.sheenColor.set(globaGUIParams.sheenColor); });


/** Irirdescence - is a rainbow effect on the material. */

// gui.add(physicalMaterial, 'iridescence').min(0).max(1).step(0.0001);
// gui.add(physicalMaterial, 'iridescenceIOR').min(0).max(2.333).step(0.0001);
// gui.add(physicalMaterial, 'iridescenceThicknessRange', '0').min(0).max(1000).step(1);
// gui.add(physicalMaterial, 'iridescenceThicknessRange', '1').min(0).max(1000).step(1);

// physicalMaterial.iridescence = 1;
// physicalMaterial.iridescenceIOR = 2.333;
// physicalMaterial.iridescenceThicknessRange = [100, 800];

/** Transmission - is a property that allows light to pass through the object. */

/** IOR - Index of refraction */
/**
 * Diamond - 2.417
 * Water - 1.333
 * Air - 1.000293
 */
gui.add(physicalMaterial, 'transmission').min(0).max(1).step(0.0001);
gui.add(physicalMaterial, 'ior').min(1).max(10).step(0.0001);
gui.add(physicalMaterial, 'thickness').min(0).max(1).step(0.0001);

physicalMaterial.transmission = 1;
physicalMaterial.ior = 1.5;
physicalMaterial.thickness = 1.1;


// Rougness material
const roughnessMaterial = new THREE.MeshPhysicalMaterial();
roughnessMaterial.roughness = 0.2;
roughnessMaterial.metalness = 0;

roughnessMaterial.transmission = 1;
roughnessMaterial.ior = 1.5;
roughnessMaterial.thickness = 1;


/** Meshes */
const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 14, 14),
    matcapMaterial
)
const torusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 128),
    standardMaterial
)
const cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 86, 86),
    roughnessMaterial
)
const thridMesh = new THREE.Mesh(
    new THREE.TetrahedronGeometry(0.5, 32),
    physicalMaterial
)


/** Lights */
const alight = new THREE.AmbientLight(0xffffff, 0.5);
const light = new THREE.PointLight(0xffffff, 30);

sphereMesh.position.x = -1.5;
thridMesh.position.x = 1.5;
cubeMesh.position.x = 3;
light.position.set(2, 3, 4);

scene.add(sphereMesh, torusMesh, thridMesh, cubeMesh/*, alight, light */);


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    const rotationY = elapsedTime / 10;
    const rotationX = elapsedTime * -0.15;

    thridMesh.rotation.y = rotationY;
    torusMesh.rotation.y = rotationY;
    sphereMesh.rotation.y = rotationY;
    cubeMesh.rotation.y = rotationY;
    thridMesh.rotation.x = rotationX;
    torusMesh.rotation.x = rotationX;
    sphereMesh.rotation.x = rotationX;
    cubeMesh.rotation.x = rotationX;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

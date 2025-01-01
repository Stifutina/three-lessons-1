import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
// import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Font Converter - https://gero3.github.io/facetype.js/

/**
 * Base
 */
// Debug
// const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
const group = new THREE.Group();

// Axes helper
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const matcapTexture = textureLoader.load('/textures/matcaps/7.png');

matcapTexture.colorSpace = THREE.SRGBColorSpace;

const matcapMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture
})

/**
 * Fonts
 */
const fontLoader = new FontLoader();

fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
   const textMesh = new THREE.Mesh(
       new TextGeometry('Hello Three.js', {
           font: font,
           size: 0.5,
           depth: 0.2,
           curveSegments: 6, // smoothness of the text, influences performance
           bevelEnabled: true,
           bevelThickness: 0.03,
           bevelSize: 0.02,
           bevelOffset: 0,
           bevelSegments: 5
       }),
       matcapMaterial
   );

    // textMesh.geometry.computeBoundingBox();
    // textMesh.geometry.translate(
    //     (-textMesh.geometry.boundingBox.max.x - 0.02) * 0.5, // bevelSize
    //     (-textMesh.geometry.boundingBox.max.y - 0.02) * 0.5, // bevelSize
    //     (-textMesh.geometry.boundingBox.max.z - 0.03) * 0.5 // bevelThickness
    // );

    textMesh.geometry.center(); // faster way to center the text

    // textMesh.geometry = new mergeVertices(textMesh.geometry, 0.0001);
    // textMesh.geometry.computeVertexNormals();
   
   scene.add(textMesh);

   const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

   

   for (let i = 0; i < 1000; i++) {
    const donut = new THREE.Mesh(
        donutGeometry,
        matcapMaterial
    );

    donut.position.x = 0.5 + (Math.random() - 0.5) * 100;
    donut.position.y = 0.5 + (Math.random() - 0.5) * 100;
    donut.position.z = 0.5 + (Math.random() - 0.5) * 100;

    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    donut.scale.setScalar(Math.random() * 0.5);

    group.add(donut);
   }

   scene.add(group);
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
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100)
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
    const elapsedTime = clock.getElapsedTime();

    group.rotation.x = elapsedTime * 0.06;
    group.rotation.y = elapsedTime * 0.08;
    group.rotation.z = elapsedTime * 0.1;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
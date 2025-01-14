import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Particle is a plane composed with 2 triangles
 * and this mesh always rotated on camera
 * we will need BufferGeometry and PointsMaterial
 * and Points instance
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
const textureLoader = new THREE.TextureLoader()

/**
 * Generate Particles:
 */
//Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 2000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3); 

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10; // fill sphere coordinates for each particle
    colors[i] = Math.random(); // fill colors for each particle
     
    for (let i = 0; i < count; i++) {
        const radius = Math.random() * 5;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
}

// particles positions need to be stored in a buffer attribute
// particles 
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xff88cc,
    sizeAttenuation: true, // create perspective effect
    transparent: true,
});

particlesMaterial.vertexColors = true; // enable vertex colors from COLORS buffer attribute

// These textures are resized versions of the pack provided by Kenney and you can find 
// the full pack here: https://www.kenney.nl/assets/particle-pack. But you can also create your own.
particlesMaterial.alphaMap = textureLoader.load('/textures/particles/1.png');



// Alpha map work incorrectly, the black background is visible

//fix 1
// particlesMaterial.alphaTest = 0.1; // remove the black background from alphaMap texture. blurring
// particlesMaterial.map = textureLoader.load('/textures/particles/1.png');

//fix 2
// deactivating the depth test could create a problem with the rendering order of other objects in the scene
// particlesMaterial.depthTest = false; // remove the black background from alphaMap texture. blurring

// fix 3
// the depth of what's being drawn is stored in the depth buffer. Instead of not testings the depth, we can just not write to it.
// THE BEST SOLUTION
particlesMaterial.depthWrite = false; // remove the black background from alphaMap texture. blurring


// the webgl currently draws pixels one on top of the other.
// With blending we can create the additive effect - to add the color of the pixel to the color which already drawn
// but this could impact performance
particlesMaterial.blending = THREE.AdditiveBlending; // add blending mode to create the additive effect



// Draw Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);


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
camera.position.z = 3
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


    // Animate particles here one by one in the loop
    // is good for small amount of particles
    // but for large amount of particles we need to use a CUSTOM SHADER
    // Update particles
    // particles.rotation.y = elapsedTime * 0.1

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // particlesGeometry contains the positions of all particles

        const x = particlesGeometry.attributes.position.array[i3];
        // const y = particlesGeometry.attributes.position.array[i3 + 1];
        // const z = particlesGeometry.attributes.position.array[i3 + 2];

        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
    }

    particlesGeometry.attributes.position.needsUpdate = true; // TELL THREE.JS THAT THE POSITION ATTRIBUTE HAS BEEN UPDATED!!!

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
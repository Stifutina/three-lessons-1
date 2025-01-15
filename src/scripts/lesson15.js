import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffe0e0',
    particlesColor: '#7ac6ff',
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Texture to show shades of toon material correctly
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg');
const particleTexture = textureLoader.load('/textures/particles/8.png');

gradientTexture.magFilter = THREE.NearestFilter; // to make the gradient texture sharp

// Page sections
const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture,
});


// Meshes
const objectsDistance = 4;

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
);
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
);
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
);

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance * 1;
mesh3.position.y = - objectsDistance * 2; 

mesh1.position.x = - 2;
mesh2.position.x = 2;
mesh3.position.x = - 2;

const sectionMeshes = [mesh1, mesh2, mesh3];

scene.add(mesh1, mesh2, mesh3);

/**
 * Particles
 */
// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 1000;

const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * objectsDistance  * sectionMeshes.length;
    const y = (objectsDistance * 0.5) - (Math.random() * objectsDistance * sectionMeshes.length);
    const z = (Math.random() - 0.5) * objectsDistance * sectionMeshes.length;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    sizeAttenuation: true,
    color: parameters.particlesColor,
    transparent: true,
    alphaMap: particleTexture,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);

directionalLight.position.set(1, 1, 0.2);

scene.add(ambientLight, directionalLight);



/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: parameters.materialColor })
// )
// scene.add(cube)


/**
 * Edit
 */


gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor)
})
gui.addColor(parameters, 'particlesColor').onChange(() => {
    particlesMaterial.color.set(parameters.particlesColor)
})

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
const cameraContainer = new THREE.Group(); // for animation

camera.position.z = 6
scene.add(cameraContainer);
cameraContainer.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true // we can make some elements behind the webgl 3D elements, and some in front of it <<<<< 
});
// if alpha is false, the background will be black
// if alpha is true, the background will be transparent and we can set setClearColor to set the color of the background
// and setClearAlpha to set the opacity of the background
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/**
 * Scroll animation data
 */

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    // Animation by sections
    const newSection = Math.round(scrollY / sizes.height);

    if (newSection !== currentSection) {
        currentSection = newSection;

        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            y: '+=5',
            x: '+=6',
            z: '+=1.3',
        })
    }
})


/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0
};

window.addEventListener('mousemove', (event) => {
    // position of cursor in normalized coordinates to SCREEN CENTER
    cursor.x = event.clientX / sizes.width - 0.5; // (0 ... 1) / 2
    cursor.y = event.clientY / sizes.height - 0.5; // -0.5 ... 0.5
})


/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime; // to prevent difference on different devices

    previousTime = elapsedTime; // speed should be same on different frame rates


    // Animate Parallax
    const parallaxX = cursor.x * 0.7;
    const parallaxY = cursor.y *  - 0.7;

    cameraContainer.position.x += (parallaxX - cameraContainer.position.x) * deltaTime * 5;
    cameraContainer.position.y += (parallaxY - cameraContainer.position.y) * deltaTime * 5;

    // Update camera
    camera.position.y = - scrollY / sizes.height * objectsDistance;
    // correct position of camera is srolled pixels, divided by window height, multiplied by objects distance


    // Animate objects
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    particles.rotation.y = elapsedTime * 0.1;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
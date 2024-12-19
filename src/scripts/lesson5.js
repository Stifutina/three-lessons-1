import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0
};


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

mesh.position.y = -1;

// Custom Geometry creating using BufferGeometry
const positionsArray = new Float32Array([
    0, 0, 0, // First vertice
    0, 1, 0, // Second vertice
    1, 0, 0 // Third vertice
]);
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
const customTriangleGeometry = new THREE.BufferGeometry();
const customTriangleMesh = new THREE.Mesh(customTriangleGeometry, material.clone());

customTriangleGeometry.setAttribute('position', positionsAttribute); 
scene.add(customTriangleMesh);

customTriangleMesh.material.color.setHex(0x00ff00);
customTriangleMesh.position.x = -1.3;


// New custom mesh:
const randomVerticesCount = 150;
const randomPositionsArray = new Float32Array(randomVerticesCount * 3 * 3);

for (let i = 0; i < randomVerticesCount * 3 * 3; i++) {
    randomPositionsArray[i] = Math.random() - 0.5;
}

const randomPostionsAtribute = new THREE.BufferAttribute(randomPositionsArray, 3);
const randomGeometry = new THREE.BufferGeometry();
randomGeometry.setAttribute('position', randomPostionsAtribute);
const randomMesh = new THREE.Mesh(randomGeometry, material.clone());

randomMesh.material.color.setHex(0x6600ff);
scene.add(randomMesh);

/**
 * Camera
 * fov is a vertival angle of view, should be between 45 and 75.
 * 
 */

const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);

camera.position.z = 2;

scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animations
 * tick - a function which will be called on every next free frame 
 * V1 with delta time
 */

const tick = () => {
    controls.update();

    // take a picture
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();


/**
 * Event listeners
 */

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

window.addEventListener('resize', () => {
    // Update sizes

    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullScreenelement;

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
        
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        
    }
})
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/Addons.js';

import accretionVertexShader from '../shaders/accretion/vertex.glsl'
import accretionFragmentShader from '../shaders/accretion/fragment.glsl'

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
    // width: 1280,
    height: window.innerHeight
    // height: 720
}

/**
 * Object
 */
const geometry = new THREE.PlaneGeometry(sizes.width / 300, sizes.height / 300, 1, 1);
const material = new THREE.ShaderMaterial({
    vertexShader: accretionVertexShader,
    fragmentShader: accretionFragmentShader,
    uniforms: {
        iResolution: { value: new THREE.Vector3(sizes.width / 10, sizes.height / 10, 1.0) },
        iTime: { value: 0.0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh);

mesh.position.normalize(); 

mesh.rotation.reorder('YXZ');

/**
 * Camera
 * fov is a vertival angle of view, should be between 45 and 75.
 * 
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 2;

scene.add(camera);

/**
 * Controls
 */
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


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

/**
 * Animations
 * tick - a function which will be called on every next free frame 
 * V1 with delta time
 */
// let prevTime = Date.now();

const clock = new THREE.Clock();

const tick = () => {
    material.uniforms.iTime.value = clock.getElapsedTime();

    // Update controls to apply damping acceleration effect
    // controls.update();

    // take a picture
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

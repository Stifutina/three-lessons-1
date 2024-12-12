import * as THREE from 'three'
import gsap from 'gsap';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh);

// mesh.position.set(1, 0.07, 0.5);
mesh.position.normalize(); // put to 1 1 1 

// mesh.scale.set(1.2, 1.1, 0.8);

mesh.rotation.reorder('YXZ'); // order of setting, rotate by y then by x.
// mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, 0);
// better to use quaternion because of rotation order


/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3;

scene.add(camera);


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)



/**
 * Animations
 * tick - a function which will be called on every next free frame
 */

/**
 * V1 with delta time
 */
// let prevTime = Date.now();

// const tick = () => {
//     // problem: the higher frame rate - the faster animation
//     // time
//     const currentTime = Date.now();
//     const deltaTime = currentTime - prevTime;

//     prevTime = currentTime;

//     mesh.rotation.y += 0.001 * deltaTime;

//     // take a picture
//     renderer.render(scene, camera);
//     window.requestAnimationFrame(tick);
// }

// tick();


/**
 * V1 with Clock
 */

// const clock = new THREE.Clock();

// const tick = () => {
//     // clock
//     const elapsedTime = clock.getElapsedTime();

//     // mesh.rotation.y = Math.PI * elapsedTime;
//     mesh.rotation.y = Math.cos(elapsedTime);
//     // mesh.position.y = Math.sin(elapsedTime);
//     // mesh.position.x = Math.cos(elapsedTime);
//     camera.position.y = Math.sin(elapsedTime);
//     camera.position.x = Math.cos(elapsedTime);
//     camera.lookAt(mesh.position);

//     // take a picture
//     renderer.render(scene, camera);
//     window.requestAnimationFrame(tick);
// }

// tick();


/**
 * V3 with GSAP
 */

gsap.to(mesh.position, {
    x: 2,
    duration: 2,
    delay: 0
});
gsap.to(mesh.position, {
    x: -1,
    duration: 1,
    delay: 2
});


const tick = () => {
    // take a picture
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();
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
 * Camera
 * fov is a vertival angle of view, should be between 45 and 75.
 * 
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// const aspectRatio = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.1, 100); // if size of orthographic camera is square, the renderer size should be also square
// far value should not be very far, because there will be glitches bugs because of z fighting
camera.position.z = 2;

scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// controls.enabled = false;
// controls.target.y = 2;
// controls.update();


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

/**
 * Animations
 * tick - a function which will be called on every next free frame 
 * V1 with delta time
 */
// let prevTime = Date.now();

const tick = () => {
    // problem: the higher frame rate - the faster animation
    // solution - check time

    // const currentTime = Date.now();
    // const deltaTime = currentTime - prevTime;
    // prevTime = currentTime;
    // mesh.rotation.y += 0.001 * deltaTime;



    // Control camera by cursor:
    // !! Controls is about the controlling and update camera by user actions

    //move camera by cursor:
    // camera.position.x = cursor.x * 10; // to follow camera by the cursor posiiton
    // camera.position.y = cursor.y * -10;
    
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3; // to turn camera horizontally around the scene with cursor position (x and z is horizontal plane)
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y;
    // camera.lookAt(mesh.position);


    // Update controls to apply damping acceleration effect
    controls.update();

    // take a picture
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

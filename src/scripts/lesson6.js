import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

/** GUI Debug */
const gui = new GUI({
    title: 'Global Controls',
    width: 320
});
const globaGUIParams = {};

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
globaGUIParams.color = '#ff8f8f';
globaGUIParams.subdivision = 2;

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const material = new THREE.MeshBasicMaterial({ color: globaGUIParams.color });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

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
 * GUI
 */
gui.add(mesh.position, 'y').min(-5).max(5).step(0.1).name('Elevation');
gui.add(mesh, 'visible');
gui.add(material, 'wireframe');
gui.addColor(globaGUIParams, 'color').onChange((value) => {
    // handle color difference issue
    // console.log('Real color: ', value.getHexString());
    material.color.set(globaGUIParams.color);
});
globaGUIParams.spin = () => {
    gsap.to(mesh.rotation, {
        y: mesh.rotation.y + Math.PI * 2,
        duration: 5
    })
}
gui.add(globaGUIParams, 'spin');
// we can change color property on fly, 
// but we can't do this to geometry. 
// If somethng changed in geometry property, it should be rebuild
gui.add(globaGUIParams, 'subdivision').min(1).max(10).step(1).onFinishChange(() => {
    // But old geometries still in gpu memory. So dispose it
    mesh.geometry.dispose(); // << Important for performance
    mesh.geometry = new THREE.BoxGeometry(1, 1, 1, globaGUIParams.subdivision, globaGUIParams.subdivision, globaGUIParams.subdivision);
});




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
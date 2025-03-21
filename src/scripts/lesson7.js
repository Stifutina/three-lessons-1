import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';

/**
 * Textures
 * PBR - Physically Based Rendering
 */

/**
 * Option 1 - with image
 */
// const image = new Image();
// const texture = new THREE.Texture(image);

// image.src = '/textures/color.jpg';

// image.onload = () => {
//     texture.needsUpdate = true;

//     // we can't use image directly, we should create texture from it
//     console.log('Image loaded', texture);
// }

// texture.colorSpace = THREE.SRGBColorSpace;


/**
 * Option 2 - with texture loader and loading manager
 */
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () => {
    console.log('onStart');
};

loadingManager.onLoad = () => {
    console.log('onLoad');
};

loadingManager.onProgress = () => {
    console.log('onProgress');
};

loadingManager.onError = () => {
    console.log('onError');
};

const textureLoader = new THREE.TextureLoader(loadingManager);

const colorTexture = textureLoader.load('/textures/color.jpg');
const alphaTexture = textureLoader.load('/textures/001.jpg');
const heightTexture = textureLoader.load('/textures/002.jpg');
const normalTexture = textureLoader.load('/textures/003.jpg');
const aoTexture = textureLoader.load('/textures/004.jpg');
const metalnessTexture = textureLoader.load('/textures/005.jpg');
const roughnessTexture = textureLoader.load('/textures/006.jpg');

colorTexture.colorSpace = THREE.SRGBColorSpace;

// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;
// colorTexture.rotation = Math.PI * 0.25;
// colorTexture.center.set(0.5, 0.5);

// min filter is used when rendering texture is smaller than original texture size
// it takes mipmaps and blend them in a way that described in minFilter
colorTexture.minFilter = THREE.NearestFilter; // looks pixelated, more sharp
colorTexture.magFilter = THREE.NearestFilter; // looks pixelated, not blurred, more sharp
colorTexture.generateMipmaps = false; // we don't need mipmaps if we use nearest filter
// when using mipmaps, the texture should be power of 2, 256x256, 512x512, 1024x1024, 2048x2048, 4096x4096


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
const material = new THREE.MeshBasicMaterial({ map: colorTexture })
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

    // Update controls to apply damping acceleration effect
    controls.update();

    // take a picture
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();

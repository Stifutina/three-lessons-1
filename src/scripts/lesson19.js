import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3);


const glTFLoader = new GLTFLoader();
let duckModel = null;

glTFLoader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
    duckModel = gltf.scene;
    duckModel.position.y = -1.2;
    scene.add(duckModel);
});

const alight = new THREE.AmbientLight(0xffffff, 1);
const dlight = new THREE.DirectionalLight(0xffffff, 1);

dlight.position.set(5, 5, 5);

scene.add(alight, dlight);


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

const arrowHelper = new THREE.ArrowHelper(raycaster.direction, raycaster.origin, 10, 0xffff00);
scene.add(arrowHelper);

/**
const rayOrigin = new THREE.Vector3(-3, 0, 0);
const rayDirection = new THREE.Vector3(10, 0, 0); // Must be normalized

rayDirection.normalize(); // ALWAYS NORMALIZE THE DIRECTION VECTOR!!! <<<

raycaster.set(rayOrigin, rayDirection);
 */

/** now when we have a raycaster we have 2 options:
 * 1. We can check if the raycaster intersects an object .intersectObject() - to test one object
 * 2. We can check if the raycaster intersects an array of objects .intersectObjects() - to test multiple objects
 */


/**
 * Distance Value of the Intersection 2.5
 * Three.js updates the objects’ coordinates (called matrices) right before rendering them. 
 * Since we do the ray casting immediately, none of the objects have been rendered.
   You can fix that by updating the matrices manually before ray casting:
 */

/**
object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld()

const intersect = raycaster.intersectObject(object2);
const intersects = raycaster.intersectObjects([object1, object2, object3]);

console.log(intersect);
console.log(intersects);
*/

/**
 * Distance - between the ray origin and the intersection point
 * face - the face of the geometry that was intersected
 * faceIndex - the index of the face of the geometry that was intersected
 * object - the object that concerned by the collision
 * point - a Vector3 of the exact position of the collision
 * uv - the UV coordinates of that geometry
 */


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
});


/**
 * Mouse Events
 */
const mouse = new THREE.Vector2(); // just x and y


// To Handle mouseenter/click
let currentIntersect = null;

window.addEventListener('mousemove', (e) => {
    // some browsers handles mousemove more often than animation frames,
    // that's why we shouldn't handle raycaster there
    mouse.x = (e.clientX / sizes.width * 2) - 1; // -1..0..1
    mouse.y = - (e.clientY / sizes.height * 2) + 1 // 1..0..-1
});

window.addEventListener('click', () => {
    if (currentIntersect) {
        switch (currentIntersect.object) {
            case object1:
                console.log('click object1');
                break;
            case object2:
                console.log('click object2');
                break;
            case object3:
                console.log('click object3');
                break;
            default:
                console.log('no click');
        }
    }
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

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    // Update controls
    controls.update();


    // Mousemove raycaster
    // Cast a ray
    raycaster.setFromCamera(mouse, camera);

    arrowHelper.setDirection(raycaster.ray.direction);
    arrowHelper.position.copy(raycaster.ray.origin);

    // Cast a ray to animated objects
    /**
    const rayOrigin = new THREE.Vector3(-3, 0, 0);
    const rayDirection = new THREE.Vector3(1, 0, 0);
    rayDirection.normalize();

    raycaster.set(rayOrigin, rayDirection);

    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    object3.updateMatrixWorld();
    */
    
    const intersects = raycaster.intersectObjects([object1, object2, object3]);
    
    
    object1.material.color.set('#ff0000');
    object2.material.color.set('#ff0000');
    object3.material.color.set('#ff0000');

    for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff');
    }
    

    if (intersects.length) {
        if (currentIntersect === null) {
            console.log('mouse enter');
        }
        currentIntersect = intersects[0];
    } else {
        if (currentIntersect !== null) {
            console.log('mouse leave');
        }
        currentIntersect = null;
    }


    if (duckModel) {
        const modelsIntersects = raycaster.intersectObject(duckModel);

        if (modelsIntersects.length) {
            duckModel.scale.set(1.5, 1.5, 1.5);
        } else {
            duckModel.scale.set(1, 1, 1);
        }
    }
    

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
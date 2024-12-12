import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh);

// mesh.position.set(1, 0.07, 0.5);
// mesh.position.normalize(); // put to 1 1 1 

// console.log('distance from center of the scene to cube position: ', mesh.position.length());


// mesh.scale.set(1.2, 1.1, 0.8);

// mesh.rotation.reorder('YXZ'); // order of setting, rotate by y then by x.
// mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, 0);
// better to use quaternion


const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xcccccc })
);
cube1.position.x = -2;
group.add(cube1);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x777777 })
);
group.add(cube2);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x444444 })
);
cube3.position.x = 2;
group.add(cube3);

const cube4 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
);
cube4.position.y = -0.5;
cube4.scale.y = 0.01
cube4.scale.x = 10
cube4.scale.z = 10
group.add(cube4);


group.position.y = 1;
group.scale.y = 2;
group.rotation.y = 1;
/**
 * Axes helper
 */
const axesHelper = new THREE.AxesHelper(3); // 3 -  is a length of stroke
scene.add(axesHelper);

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
camera.position.y = 0.3;
// camera.position.x = 1;

camera.lookAt(group.position);

scene.add(camera);

console.log('distance from cube to camera: ', group.position.distanceTo(camera.position));

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)
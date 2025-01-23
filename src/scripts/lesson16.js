import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es';

/**
 * Physics. 
 * There are many physics libraries for Three.js, but the most popular one is cannon.js.
 * We need to decide if we want to use 2D or 3D physics. Some 3D interactions ight be reduced to 2D physics.
 * 
 * 3D Physics libraries:
 * Ammo js
 * Cannon js
 * Oimo js
 * 
 * 2D Physics libraries:
 * Matter js
 * P2 js
 * Planck js
 * Box2D js
 */

/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])


/**
 * Physics
 */
// World
const world = new CANNON.World();

world.gravity.set(0, -9.82, 0);

// Materials
// Material is a BEHAVIOUR property of body
// this are not visible, but they are used to define how bodies interact with each other
// this is just REFERENCES
const defaultMaterial = new CANNON.Material('default'); // we can name it as we want
// const plasticMaterial = new CANNON.Material('plastic'); 

// Contact material
// it's a combination of two materials
// !!! >>> describe how two materials interact with each other
const defaultCollideBehaviourMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial, // 2 mateials that we want to combine
    {
        friction: 0.1, // how much they slide on collision
        restitution: 0.7 // how much they bounce on collision
    }
);

// Add contact material to the world
world.addContactMaterial(defaultCollideBehaviourMaterial);
world.defaultContactMaterial = defaultCollideBehaviourMaterial; // default material for all bodies


// If in ThreeJs we create meshes, in cannon we create bodies
// to create a body we need to create a shape

// Sphere shape:
const sphereShape = new CANNON.Sphere(0.5); // radius of threejs sphere geometry
const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape,
    // material: plasticMaterial // we can define material here
    // it falls down because of gravity, but it not bouncing. 
    // Bouncing and others are properties of Material. 
    // Material is a BEHAVIOUR property of body
    // Material is just a reference, it's not a some visible
    // we should create one of each type of material in the scene (plastic, concrete, jelly, etc)
});

// Interactions with bodies can be done by applying forces
/**
 * There are many ways to apply forces to a Body:

applyForce to apply a force to the Body from a specified point in space (not necessarily on the Body's surface) like the wind that pushes everything a little all the time, a small but sudden push on a domino or a greater sudden force to make an angry bird jump toward the enemy castle.
applyImpulse is like applyForce but instead of adding to the force that will result in velocity changes, it applies directly to the velocity.
applyLocalForce is the same as applyForce but the coordinates are local to the Body (meaning that 0, 0, 0 would be the center of the Body).
applyLocalImpulse is the same as applyImpulse but the coordinates are local to the Body.


Because using "force" methods will result in velocity changes, let's not use "impulse" methods
 */

// here we pushing the sphere to the right and it starts jumping and rolling to +X from the start
// like someone dropped it from the height to the right
// first argument is the force, second is the position of force
sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0)); // force, point of force

world.addBody(sphereBody);

// Floor shape:
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();

// floorBody.material = concreteMaterial;
floorBody.mass = 0; // 0 means that it is static
floorBody.addShape(floorShape);

// !!! >>> if threejs mesh rotated, we need to ROTATE BODIES attached to it in a same way
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), 
    Math.PI * 0.5 // horizontal mathematical infinity plane and infinity down, as Ground.
); // rotate it to be horizontal



world.addBody(floorBody);


/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    const deltaTime = elapsedTime - oldElapsedTime;

    oldElapsedTime = elapsedTime;

    // Update physics world
    // first param is the fixed time step, 
    // second is how much time passed since last step, 
    // third one is how much iterations we want to apply to the physics
    sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position); // a bit wind effect

    world.step(1 / 60, deltaTime, 3);

    // Update Threejs world
    // sphere is falling down, but we need to see it
    sphere.position.copy(sphereBody.position);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es';

/**
 * Physics. 
 * Physics is always calculating by CPU. Solution - to use Web Workers.
 * 
 * There are many physics libraries for Three.js, but the most popular one is cannon.js.
 * We need to decide if we want to use 2D or 3D physics. Some 3D interactions ight be reduced to 2D physics.
 * 
 * 3D Physics libraries:
 * Ammo js
 * Cannon js http://schteppe.github.io/cannon.js/docs DOCS <<<
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
const gui = new GUI();
const debugObject = {};

debugObject.createSphere = () => {
    createSphere(Math.random(), {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3
    });
};
gui.add(debugObject, 'createSphere');

debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(), 
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    );
};
gui.add(debugObject, 'createBox');

// Reset scene
debugObject.resetScene = () => {
    for (const object of objectsToUpdate) {
        object.mesh.geometry.dispose();
        object.mesh.material.dispose();
        scene.remove(object.mesh);

        world.removeBody(object.body);
    }

    objectsToUpdate.splice(0, objectsToUpdate.length)
    objectsToUpdate.length = 0;
};

gui.add(debugObject, 'resetScene');




/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();



/**
 * Sounds
 * You can listen to events on the Body. That can be useful if you want to do things like play a sound when objects collide or if you want to know if a projectile has touched an enemy.
 * You can listen to events on Body such as 'colide', 'sleep' or 'wakeup'.
 */
const hitSound = new Audio('/sounds/hit.mp3'); // native js audio
let lastSoundTime = 0;

hitSound.preservesPitch = false;

const playHitSound = (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal();
    const currentTime = Date.now();

    console.log('collision', collision);
    console.log('collision.body.mass', collision.body.mass)

    if (impactStrength > 1.5 && (currentTime - lastSoundTime) > 70) {
        hitSound.volume = Math.min((impactStrength * (collision.target.mass / 2) / 10), 1);
        hitSound.playbackRate = 0.25 + (3.75 - collision.target.mass / 3);
        
        hitSound.currentTime = 0;
        hitSound.play();
        lastSoundTime = currentTime;
    }
}



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
]);

/**
 * Material
 */
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
});

const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
});


/**
 * Physics
 */

// This needs to be optimized, because on every frame 

// CPU is checking every object is it collaiding with another object or not
// Why would you test the boxes from one pile against the boxes in the other pile? They are too far to be colliding.
// 1. So we set SAPBroadphase to world.broadphase
/**
 * There are 3 broadphase algorithms available in Cannon.js:
   NaiveBroadphase: Tests every Bodies against every other Bodies
   GridBroadphase: Quadrilles the world and only tests Bodies against other 
                   Bodies in the same grid box or the neighbors' grid boxes.
   SAPBroadphase (Sweep and prune broadphase): Tests Bodies on arbitrary axes during multiples steps.
 
   The default broadphase is NaiveBroadphase, and I recommend you to switch to SAPBroadphase.  <<<<<
   Using this broadphase can eventually generate bugs where a collision doesn't occur, 
   but it's rare, and it involves doing things like moving Bodies very fast.
   To switch to SAPBroadphase, simply instantiate it in the world.broadphase 
   property and also use this same world as parameter:
*/

// 2. Another option to optimize is to enable allowSleeping
/**
 * Even if we use an improved broadphase algorithm, all the Body are tested, even those not moving anymore. We can use a feature called sleep.
   When the Body speed gets incredibly slow (at a point where you can't see it moving), the Body can fall asleep and won't be tested unless a sufficient force is applied to it by code or if another Body hits it.
   To activate this feature, simply set the allowSleep property to true on the World
*/

// World
const world = new CANNON.World();

world.broadphase = new CANNON.SAPBroadphase(world); // SAPBroadphase is better for PERFORMACE!
world.allowSleep = true; // allow sleeping for better performance

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


/***
 * Constraints could be used for interactions:
   Constraints, as the name suggests, enable constraints between two bodies. 
    They can be used to create joints, hinges, or any other kind of interaction between two or more bodies.
    HingeConstraint: acts like a door hinge. http://schteppe.github.io/cannon.js/docs/classes/HingeConstraint.html
    DistanceConstraint: forces the bodies to keep a distance between each other. http://schteppe.github.io/cannon.js/docs/classes/DistanceConstraint.html
    LockConstraint: merges the bodies like if they were one piece. http://schteppe.github.io/cannon.js/docs/classes/LockConstraint.html
    PointToPointConstraint: glues the bodies to a specific point. http://schteppe.github.io/cannon.js/docs/classes/PointToPointConstraint.html
 */


// If in ThreeJs we create meshes, in cannon we create bodies
// to create a body we need to create a shape


// Interactions with bodies can be done by applying forces
/**
 * There are many ways to apply forces to a Body:

applyForce to apply a force to the Body from a specified point in space (not necessarily on the Body's surface) like the wind that pushes everything a little all the time, a small but sudden push on a domino or a greater sudden force to make an angry bird jump toward the enemy castle.
applyImpulse is like applyForce but instead of adding to the force that will result in velocity changes, it applies directly to the velocity.
applyLocalForce is the same as applyForce but the coordinates are local to the Body (meaning that 0, 0, 0 would be the center of the Body).
applyLocalImpulse is the same as applyImpulse but the coordinates are local to the Body.


Because using "force" methods will result in velocity changes, let's not use "impulse" methods
 */



// Floor shape:
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();

// floorBody.material = concreteMaterial;
floorBody.mass = 0; // 0 means that it is static
floorBody.addShape(floorShape);

// !!! >>> if threejs mesh rotated, we need to ROTATE BODIES attached to it in a same way
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), 
    Math.PI * 0.5 // horizontal mathematical infinity plane and infinity down, like Ground.
); // rotate it to be horizontal

world.addBody(floorBody);



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
scene.add(floor);


// Default Sphere
const sphereDefaultGeometry = new THREE.SphereGeometry(1, 20, 20);

// Default Box
const boxDefaultGeometry = new THREE.BoxGeometry(1, 1, 1);

// array of objects (meshes) that we want to update
const objectsToUpdate = [];

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/**
 * Utils
 */
const createSphere = (radius, position) => {
    // Three.js Mesh
    const mesh = new THREE.Mesh(
        sphereDefaultGeometry,
        sphereMaterial
    );

    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position);

    scene.add(mesh);


    // Cannon.js Body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: radius * 10,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape,
        material: defaultMaterial
    });

    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    // Save in objectsToUpdate
    objectsToUpdate.push({ mesh, body });
}

createSphere(0.5, { x: 0, y: 3, z: 0 });

const createBox = (width, height, depth, position) => {
    // Three.js Mesh
    const mesh = new THREE.Mesh(boxDefaultGeometry, boxMaterial);

    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;

    scene.add(mesh);


    // Cannon.js Body
    // sizes should be divided by 2 because we start calculating the math of the Cannonjs shape from the center of the object
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial
    });

    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    // Save in objectsToUpdate
    objectsToUpdate.push({ mesh, body });
};




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

    world.step(1 / 60, deltaTime, 3);

    // Update Threejs world according to physics world
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from 'lil-gui'

/**
 * THREE EDITOR >>> https://threejs.org/editor/
 * Like a tiny 3D editor for Three.js
 */


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
 * Models
 */
// Loaders
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader(); // We have different loaders for different file types

// There is also Loading manager to load multiple files at once. 

/** Duck: */
gltfLoader.load('/models/Duck/glTF/Duck.gltf', 
    (gltf) => {
        console.log('%cGLTF success:', 'color: green; font-weight: bold;', gltf);


        const duckMesh = gltf.scene.children[0];


        scene.add(duckMesh);
        duckMesh.position.set(2, 0, 2);

        gui.add(duckMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Simple glTF Duck Rotation');
    },
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`%cLoading: ${Math.round(percentComplete)}%`, 'color: yellow; font-weight: bold;');
    },
    (error) => {
        console.log(`%cError: ${error}%`, 'color: red; font-weight: bold;');
    }
);

/** Helmet */
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', 
    (gltf) => {
        console.log('%cGLTF success:', 'color: green; font-weight: bold;', gltf);

        const helmetScene = gltf.scene;
        const helmetGroup = new THREE.Group();

        // we need to add all helment scene children to the helmet group one by one,
        // but we CAN'T USE FOR..LOOP because of async nature of the loader !!! <<<
        // There are 2 solutions:

        // we can use recursive function to add all children to the group
        
        // while (helmetScene.children.length) {
        //     helmetGroup.add(helmetScene.children[0]);
        // }

        // other solution is to duplicate the gltf helmet children 
        // array in order to have an unaltered independent array:
        const helmetChildren = [...helmetScene.children]; // duplicate the array

        for (const child of helmetChildren) {
            helmetGroup.add(child);
        }


        scene.add(helmetGroup);

        helmetGroup.position.set(-3, 0, 3);
        helmetGroup.scale.set(2.5, 2.5, 2.5);

        gui.add(helmetGroup.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Helmet Rotation');
    },
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`%cLoading: ${Math.round(percentComplete)}%`, 'color: yellow; font-weight: bold;');
    },
    (error) => {
        console.log(`%cError: ${error}%`, 'color: red; font-weight: bold;');
    }
);



/** Draco Duck */
/** 
 * Use the Draco compression because it is the best compression for 3D models
 * Also we can run our draco loader in a web assembly thread to make it faster
 * to do this we need to replace draco folder from the Three npm folder to the static folder of our project <<< !!!
 * and after that we can do this:
 */
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader); // we set the draco loader to the gltf loader

// now we can load draco compressed models >>
// Draco loader is cool, but it's reliable only for complex big models, for small models it's not worth it
// because cpu will freeze while decoding the model !!! <<<
gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf', 
    (gltf) => {
        console.log('%cGLTF success:', 'color: green; font-weight: bold;', gltf);


        const duckDracoMesh = gltf.scene.children[0];


        scene.add(duckDracoMesh);
        duckDracoMesh.position.set(-2, 0, -2);

        gui.add(duckDracoMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Duck Draco Rotation');
    },
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;

        console.log(`%cLoading: ${Math.round(percentComplete)}%`, 'color: yellow; font-weight: bold;');
    },
    (error) => {
        console.log(`%cError: ${error}%`, 'color: red; font-weight: bold;');
    }
);


/**
 * Animated model
 * Fox
 * glTF Model contains animations composed of AnimationClip[] array. It's like keyframes. 
 * We need to create AnimationMixer to play the animations.
 * AnimationMixer is like a player associated with an object that can contain one or many AnimationClip.
 */
let animationFoxMixer = null;
let foxActions = [];
let currentAction = null;

gltfLoader.load('/models/Fox/glTF/Fox.gltf', 
    (gltf) => {
        console.log('%cGLTF success:', 'color: green; font-weight: bold;', gltf);

        animationFoxMixer = new THREE.AnimationMixer(gltf.scene);
        const foxMesh = gltf.scene.children[0];

        // Create actions for each animation
        foxActions = gltf.animations.map((clip) => animationFoxMixer.clipAction(clip));

        // Play the first animation by default
        currentAction = foxActions[0];
        currentAction.play();

        scene.add(foxMesh);
        foxMesh.scale.set(0.1, 0.1, 0.1);
        foxMesh.position.set(0, 0, 0);

        gui.add(foxMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Fox Rotation');

        // GUI control to switch between animations
        const animationsFolder = gui.addFolder('Animations');
        const animations = { animation: 'Animation 1' };
        animationsFolder.add(animations, 'animation', ['Animation 1', 'Animation 2', 'Animation 3']).onChange((value) => {
            const index = parseInt(value.split(' ')[1]) - 1;
            if (currentAction) currentAction.stop();
            currentAction = foxActions[index];
            currentAction.play();
        });
    },
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`%cLoading: ${Math.round(percentComplete)}%`, 'color: yellow; font-weight: bold;');
    },
    (error) => {
        console.log(`%cError: ${error}%`, 'color: red; font-weight: bold;');
    }
);



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(15, 2, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
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
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime;

    // Update animated scene mixer
    if (animationFoxMixer) {
        animationFoxMixer.update(deltaTime);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
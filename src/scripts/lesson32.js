import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import particlesVertexShader from '/shaders/particles/vertex.glsl'
import particlesFragmentShader from '/shaders/particles/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particles && particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)



/**
 * Particles
 */
let particles = null;


// Load models
gltfLoader.load(
    '/models/models.glb',
    (gltf) =>
    {
        // console.log('gltf', gltf);
        
        particles = {};

        particles.maxCount = 0;
        particles.index = 0;

        // Positions
        const positions = gltf.scene.children.map(child => child.geometry.attributes.position);

        for (const position of positions) {
            if (position.count > particles.maxCount) {
                particles.maxCount = position.count;
                // particles.maxCount = 10000;
            }
        }

        

        // New positions array. To unify the number of particles across all geometries.
        particles.positions = [];
        for (const position of positions) {
            const originalArray = position.array;
            const newArray = new Float32Array(particles.maxCount * 3);

            for (let i = 0; i < particles.maxCount; i++) {
                const i3 = i * 3;

                // If we can take 3 values from the original array, we do it.
                // If not, we fill the new array with random values of originalArray.
                if (i3 < originalArray.length) {
                    newArray.set(originalArray.subarray(i3, i3 + 3), i3); 
                } else {
                    const randomIndex = Math.floor(position.count * Math.random()) * 3; // Random index in the original array

                    newArray.set([
                            originalArray[randomIndex], 
                            originalArray[randomIndex + 1], 
                            originalArray[randomIndex + 2]
                        ], i3
                    ); // Fill with random values from originalArray
                }
            }

            particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3));
        }

        // Random sizes
        const sizesArray = new Float32Array(particles.maxCount);
        for (let i = 0; i < particles.maxCount; i++) {
            sizesArray[i] = Math.random() * 1.1 - 0.1;
        }
        const randomArray = new Float32Array(particles.maxCount);
        for (let i = 0; i < particles.maxCount; i++) {
            randomArray[i] = Math.random() * 2 - 1
        }
        particles.sizes = new THREE.Float32BufferAttribute(sizesArray, 1);

        // Geometry
        particles.geometry = new THREE.BufferGeometry();
        particles.geometry.setAttribute('position', particles.positions[particles.index]); // Use the second geometry's
        particles.geometry.setAttribute('aPositionTarget', particles.positions[3]); // Use the second geometry's
        particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(particles.sizes.array, 1)); // Use the sizes array
        particles.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 1)); // Use the random array
        console.log(particles.geometry.attributes['aRandom'])
        // particles.geometry.setIndex(null); // Disable index to avoid multiply (6) particles in same position

        // Material
        particles.colorA = 0xff5900; // Bright blue
        particles.colorB = 0x3100e0; // Orange
        particles.material = new THREE.ShaderMaterial({
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms:
            {
                uSize: new THREE.Uniform(0.3),
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                uProgress: new THREE.Uniform(0.0), // Progress of the mix between original and target positions
                uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
                uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
                uTime: new THREE.Uniform(0.0), // For animations, if needed
            },
            // transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        // Points
        particles.points = new THREE.Points(particles.geometry, particles.material);
        particles.points.frustumCulled = false; // Disable frustum culling to ensure all points are rendered
        scene.add(particles.points);

        particles.morph = (index) => {
            // update geometry attributes
            particles.geometry.setAttribute('position', particles.positions[particles.index]);
            particles.geometry.setAttribute('aPositionTarget', particles.positions[index]);

            // animate uprogress
            gsap.fromTo(particles.material.uniforms.uProgress,
                { value: 0 },
                { value: 1, duration: 3.0, ease: 'linear' }
            );

            particles.index = index; // Update current index
            particles.material.uniforms.uProgress.value = 0; // Reset progress
        }

        particles.morph0 = () => particles.morph(0);
        particles.morph1 = () => particles.morph(1);
        particles.morph2 = () => particles.morph(2);
        particles.morph3 = () => particles.morph(3);

        // GUI Tweak
        gui.add(particles.material.uniforms.uProgress, 'value', 0, 1, 0.01).name('Mix Progress').listen();

        // Tweak colors
        gui.addColor(particles, 'colorA').name('Color A').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) });
        gui.addColor(particles, 'colorB').name('Color B').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) });

        // Morphing buttons
        gui.add(particles, 'morph0').name('Morph to 0');
        gui.add(particles, 'morph1').name('Morph to 1');
        gui.add(particles, 'morph2').name('Morph to 2');
        gui.add(particles, 'morph3').name('Morph to 3');
    },
    undefined,
    (error) =>
    {
        console.error('An error happened while loading the model:', error)
    }
)

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Update particles time uniform
    if (particles) {
        particles.material.uniforms.uTime.value += 0.05; // Increment time for animations
        // particles.material.uniforms.uProgress.value = Math.min(particles.material.uniforms.uProgress.value, 1.0); // Clamp progress to 1.0
    }

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

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
 * Galaxy
 */
const parameters = {};

parameters.count = 10000;
parameters.size = 0.03;
parameters.radiusX = 5;
parameters.radiusZ = 7;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.7;
parameters.randomnessPower = 3;
parameters.insideColor = '#ff9752';
parameters.outsideColor = '#133ca4';


// We need
// 1. Geometry
// 2. Material 
// 3. Points

let geometry = null;
let material = null;
let points = null;

const textureLoader = new THREE.TextureLoader()

const generateGalaxy = () => {

    // CLEAR PREVIOUS GALAXY
    if (points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    // GENERATE NEW GALAXY

    // 1. Geometry
    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const sizes = new Float32Array(parameters.count * 3);
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    
    for(let i = 0; i < parameters.count * 3; i++) {
        const i3 = i * 3;

        // Position
        const radiusX = parameters.radiusX;
        const radiusZ = parameters.radiusZ;
        const aspect = radiusX / radiusZ;
        const radius = Math.random() * Math.sqrt(radiusX * radiusX + radiusZ * radiusZ);

        const spinAngle = radius * parameters.spin;
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2; // angle to next branch

        // Randomness
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;

        positions[i3] = (Math.cos(branchAngle + spinAngle) * radius + randomX) * aspect; // X
        positions[i3 + 1] = randomY * (1 - radius / Math.sqrt(parameters.radiusX * parameters.radiusX + parameters.radiusZ * parameters.radiusZ)); // Y
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle ) * radius + randomZ;  // Z


        // Color
        const mixedColor = colorInside.clone();

        mixedColor.lerp(colorOutside, radius / parameters.radiusX);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        sizes[i] = parameters.size + (1 / radius);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 3));

    // 2. Material
    material = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: textureLoader.load('/textures/particles/1.png') }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (100.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
                gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
    });

    material.alphaMap = textureLoader.load('/textures/particles/1.png');


    // 3. Points
    points = new THREE.Points(geometry, material);
    scene.add(points);
}



gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radiusX').min(1).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'radiusZ').min(1).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

generateGalaxy();



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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
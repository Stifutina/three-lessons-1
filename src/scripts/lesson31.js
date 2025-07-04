import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js'
import GUI from 'lil-gui'
import gsap from 'gsap';
import fireworksVertexShader from '../shaders/fireworks/vertex.glsl'
import fireworksFragmentShader from '../shaders/fireworks/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Loaders
const textureLoader = new THREE.TextureLoader();

const textures = [
    textureLoader.load('/textures/particles/1.png'),
    textureLoader.load('/textures/particles/2.png'),
    textureLoader.load('/textures/particles/3.png'),
    textureLoader.load('/textures/particles/4.png'),
    textureLoader.load('/textures/particles/5.png'),
    textureLoader.load('/textures/particles/6.png'),
    textureLoader.load('/textures/particles/7.png'),
    textureLoader.load('/textures/particles/8.png')
]


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio);

    sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Sky
 */


// Add Sky
const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );

const sun = new THREE.Vector3();

/// GUI

const skyParameters = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.95,
    elevation: -2.2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
};

function updateSky() {
    const uniforms = sky.material.uniforms;

    uniforms[ 'turbidity' ].value = skyParameters.turbidity;
    uniforms[ 'rayleigh' ].value = skyParameters.rayleigh;
    uniforms[ 'mieCoefficient' ].value = skyParameters.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = skyParameters.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - skyParameters.elevation );
    const theta = THREE.MathUtils.degToRad( skyParameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    renderer.toneMappingExposure = skyParameters.exposure;
    renderer.render( scene, camera );

}


gui.add( skyParameters, 'turbidity', 0.0, 20.0, 0.1 ).onChange( updateSky );
gui.add( skyParameters, 'rayleigh', 0.0, 4, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( updateSky );
gui.add( skyParameters, 'elevation', -3, 90, 0.01 ).onChange( updateSky );
gui.add( skyParameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSky );
gui.add( skyParameters, 'exposure', 0, 1, 0.0001 ).onChange( updateSky );

updateSky();






/**
 * Fireworks
 */
const createFirework = (count, texture, position, size, radius, color) => {
    // Geometry
    const positionsArray = new Float32Array(count * 3);
    const sizesArray = new Float32Array(count);
    const timeMultipliers = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Spherical
        const spherical = new THREE.Spherical(
            radius * (0.75 + Math.random() * 0.25), // Random radius between 0.75 and 1
            Math.random() * Math.PI, 
            Math.random() * Math.PI * 2
        );
        const position = new THREE.Vector3().setFromSpherical(spherical);

        sizesArray[i] = Math.random() * size; // Set the size of each point
        timeMultipliers[i] = 1 + Math.random(); // Random time multiplier for each point
        positionsArray[i3] = position.x; // x
        positionsArray[i3 + 1] = position.y; // y
        positionsArray[i3 + 2] = position.z; // z
    }
    
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3));
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1)); // Set the size attribute for each point
    geometry.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1)); // Set the time multiplier for each point

    texture.flipY = false; // Prevents the texture from being flipped vertically

    // Material
    const material = new THREE.ShaderMaterial({
        vertexShader: fireworksVertexShader,
        fragmentShader: fireworksFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(size), // Size of the points
            uResolution: new THREE.Uniform(sizes.resolution), // Resolution of the canvas
            uTexture: new THREE.Uniform(texture), // Texture for the points
            uColor: new THREE.Uniform(color), // Color of the firework
            uProgress: new THREE.Uniform(0)
        },
        transparent: true, // Enable transparency
        depthWrite: false, // Disable depth writing to allow blending
        blending: THREE.AdditiveBlending // Use additive blending for a glowing effect
    })

    // Points
    const fireworks = new THREE.Points(geometry, material);

    const destroy = () => {
        gsap.killTweensOf(material.uniforms.uProgress); // Stop any ongoing animations
        scene.remove(fireworks); // Remove the firework from the scene
        fireworks.geometry.dispose(); // Dispose of the geometry
        fireworks.material.dispose(); // Dispose of the material
    }

    fireworks.position.copy(position);
    scene.add(fireworks);

    // Animate

    gsap.to(material.uniforms.uProgress, {
        duration: 3,
        value: 1,
        ease: 'linear',
        onComplete: destroy
    });
}

const createRandomFirework = (clickPoint) => {
    createFirework(
        Math.round(400 + Math.random() * 1000), // Random number of points
        textures[Math.floor(Math.random() * textures.length)], // Random texture
        new THREE.Vector3(
            clickPoint.x, // Random x position
            clickPoint.y, // Random y position
            (Math.random() - 0.5) // Random z position
        ),
        0.4 + Math.random() * 0.6, // Random size between 0.4 and 1
        1 + Math.random() * 2, // Random radius between 1 and 3
        new THREE.Color().setHSL(Math.random(), 1, 0.7) // Random color
    )
}

window.addEventListener('click', (e) => {
    // Create a firework on click
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const ndc = new THREE.Vector2(
        (e.clientX / sizes.width) * 2 - 1,
        -(e.clientY / sizes.height) * 2 + 1
    );

    // Raycast from camera to find intersection with z=0 plane
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);

    // Plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const clickPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, clickPoint);


    createRandomFirework(clickPoint);
});


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
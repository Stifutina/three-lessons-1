import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
import GUI from 'lil-gui'
import earthVertexShader from '/shaders/earth/vertex.glsl'
import earthFragmentShader from '/shaders/earth/fragment.glsl'
import atmosphereVertexShader from '/shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from '/shaders/atmosphere/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */
const earthColorParameters = {};

earthColorParameters.atmosphereDayColor = '#3182fd';
earthColorParameters.atmosphereNightColor = '#ff6600';

// Textures
const earthDayTexture = textureLoader.load('/earth/day.jpg');
const earthNightTexture = textureLoader.load('/earth/night.jpg');
const earthSpecularCloudsTexture = textureLoader.load('/earth/specularClouds.jpg');
const earthNormalTexture = textureLoader.load('/earth/2k_earth_normal_map.jpg');

earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8; // Improve texture quality at oblique angles
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8; // Improve texture quality at oblique angles

earthSpecularCloudsTexture.anisotropy = 8;

// Lens flare textures
const lensflareTexture0 = textureLoader.load('/lenses/lensflare0.png')
const lensflareTexture1 = textureLoader.load('/lenses/lensflare1.png')

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uNormalTexture: new THREE.Uniform(earthNormalTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmophereDayColor: new THREE.Uniform(new THREE.Color(earthColorParameters.atmosphereDayColor)),
        uAtmophereNightColor: new THREE.Uniform(new THREE.Color(earthColorParameters.atmosphereNightColor))
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth);

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmophereDayColor: new THREE.Uniform(new THREE.Color(earthColorParameters.atmosphereDayColor)),
        uAtmophereNightColor: new THREE.Uniform(new THREE.Color(earthColorParameters.atmosphereNightColor))
    }
});
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.multiplyScalar(1.04);
scene.add(atmosphere);


/**
 * Sun
 */
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

// Lens flare
const lensflare = new Lensflare()
lensflare.addElement(new LensflareElement(lensflareTexture0, 400, 0, new THREE.Color(0xffffff)))
lensflare.addElement(new LensflareElement(lensflareTexture1, 150, 0.2, new THREE.Color(0xffdd88)))
lensflare.addElement(new LensflareElement(lensflareTexture1, 100, 0.4, new THREE.Color(0xffaa44)))
lensflare.addElement(new LensflareElement(lensflareTexture1, 80, 0.6, new THREE.Color(0xff8833)))
lensflare.addElement(new LensflareElement(lensflareTexture1, 60, 0.8, new THREE.Color(0xffffcc)))
lensflare.addElement(new LensflareElement(lensflareTexture1, 50, 1.0, new THREE.Color(0xffeeaa)))
scene.add(lensflare)

// Update sun position
const updateSun = () => {
    sunDirection.setFromSpherical(sunSpherical);
    lensflare.position.copy(sunDirection).multiplyScalar(5);
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
}

updateSun();

// Tweaks
gui.addColor(earthColorParameters, 'atmosphereDayColor').name('Day Atmosphere Color').onChange(() => {
    earthMaterial.uniforms.uAtmophereDayColor.value.set(earthColorParameters.atmosphereDayColor);
    atmosphereMaterial.uniforms.uAtmophereDayColor.value.set(earthColorParameters.atmosphereDayColor);
});
gui.addColor(earthColorParameters, 'atmosphereNightColor').name('Night Atmosphere Color').onChange(() => {
    earthMaterial.uniforms.uAtmophereNightColor.value.set(earthColorParameters.atmosphereNightColor);
    atmosphereMaterial.uniforms.uAtmophereNightColor.value.set(earthColorParameters.atmosphereNightColor);
});
gui.add(sunSpherical, 'phi', 0, Math.PI, 0.01).name('Sun Phi').onChange(updateSun);
gui.add(sunSpherical, 'theta', -Math.PI, Math.PI, 0.01).name('Sun Theta').onChange(updateSun);


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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
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
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000001')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from '/shaders/shading-water/vertex.glsl'
import waterFragmentShader from '/shaders/shading-water/fragment.glsl'

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

const axesHelper = new THREE.AxesHelper();

axesHelper.position.y += 0.25; // Slightly above the ground to avoid z-fighting
scene.add(axesHelper);

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(20, 20, 512, 512);

waterGeometry.deleteAttribute('normal'); // Remove default normals to avoid z-fighting issues
waterGeometry.deleteAttribute('uv'); // Remove default UVs to avoid z-fighting issues

// Colors
debugObject.depthColor = '#ff4000'
debugObject.surfaceColor = '#151c37'

gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    side: THREE.DoubleSide,
    uniforms:
    {
        uTime: { value: 0 },
        
        uBigWaveElevation: { value: 0.113 },
        uBigWaveFrequency: { value: new THREE.Vector2(0.45, 0.588) },
        uBigWaveSpeed: { value: 0.39 },

        uSmallWaveElevation: { value: 0.09 },
        uSmallWaveFrequency: { value: 1.532 },
        uSmallWaveSpeed: { value: 0.173 },
        uSmallWaveIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.225 },
        uColorMultiplier: { value: 5.0 }
    }
})

gui.add(waterMaterial.uniforms.uBigWaveElevation, 'value').min(0).max(1).step(0.001).name('uBigWaveElevation')
gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWaveFrequencyX')
gui.add(waterMaterial.uniforms.uBigWaveFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWaveFrequencyY')
gui.add(waterMaterial.uniforms.uBigWaveSpeed, 'value').min(0).max(4).step(0.001).name('uBigWaveSpeed')

gui.add(waterMaterial.uniforms.uSmallWaveElevation, 'value').min(0).max(1).step(0.001).name('uSmallWaveElevation')
gui.add(waterMaterial.uniforms.uSmallWaveFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWaveFrequency')
gui.add(waterMaterial.uniforms.uSmallWaveSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWaveSpeed')
gui.add(waterMaterial.uniforms.uSmallWaveIterations, 'value').min(0).max(5).step(1).name('uSmallWaveIterations')

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

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
camera.position.set(1, 1, 1)
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
renderer.toneMapping = THREE.ACESFilmicToneMapping;

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Water
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShaderGrad from '../shaders/nice_gradient/vertex.glsl'
import fragmentShaderGrad from '../shaders/nice_gradient/fragment.glsl'
import vertexShaderRed from '../shaders/red_plane/vertex.glsl'
import fragmentShaderRed from '../shaders/red_plane/fragment.glsl'
import vertexShaderWave from '../shaders/waves/vertex.glsl'
import fragmentShaderWave from '../shaders/waves/fragment.glsl'
import vertexShaderTest from '../shaders/test/vertex.glsl'
import fragmentShaderTest from '../shaders/test/fragment.glsl'
import vertexShaderSimpleTest from '../shaders/shader_test/vertex.glsl'
import fragmentShaderSimpleTest from '../shaders/shader_test/fragment.glsl'

/**
 * Shaders
 * - Vertex shader: runs for each vertex
 * - Fragment shader: runs for each pixel
 * 
 * Some input data like position of the mesh or camera are same for all vertices/pixels. Those are uniforms.
 * Some input data like position of the vertex are different for each vertex. Those are attributes.
 * - Uniforms: data that is the same for all vertices/pixels
 * - Attributes: data that is different for each vertex
 * 
 * Vertex shader using for position of the vertex
 * Fragment shader using for color of the pixel
 * 
 * We cannot send attributes from vertex shader to fragment shader. 
 * We can only send data from vertex shader to fragment shader using varying.
 *  - Varying: data that is passed from vertex shader to fragment shader
 * 
 * 
 * Materials:
 * ShaderMaterial: will have some code automatically added to the shader codes
 * RawShaderMaterial: will have nothing
 * 
 * 
 
Documentation:


https://shaderific.com/glsl.html

Shaderific is an iOS application that lets you play with GLSL. 
The application is not something to care about, but the documentation isn't too bad.

Kronos Group OpenGL reference pages
https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/indexflat.php

This documentation deals with OpenGL, but most of the standard 
functions you'll see will be compatible with WebGL. 
Let's not forget that WebGL is just a JavaScript API to access OpenGL.

Book of shaders documentation
https://thebookofshaders.com/

The book of shaders mainly focus on fragment shaders and has 
nothing to do with Three.js but it is a great resource to learn 
and it has its own glossary (https://thebookofshaders.com/glossary/).


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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const randoms = new Float32Array(geometry.attributes.position.count);

for (let i = 0; i < randoms.length; i++) {
    randoms[i] = Math.random();
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

// Material - nice gradient ^_^
const materialGrad = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderGrad,
    fragmentShader: fragmentShaderGrad,
    uniforms: {
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true
})


// Material - waves
const materialWaves = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderWave,
    fragmentShader: fragmentShaderWave,
    uniforms: {
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true
})


// Material - red colored plane
const materialRed = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderRed,
    fragmentShader: fragmentShaderRed,
    uniforms: {
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true
})

// Material - red colored plane
// we can also pass some color or TEXTURE to the shader to colorize the mesh fragments <<< !!!
// to do this we need to use sampler2D texture type in the fragment shader:
// vec4 color = texture2D(uTexture, vUv);
// gl_FragColor = color;


const materialTest = new THREE.RawShaderMaterial({
    vertexShader: vertexShaderTest,
    fragmentShader: fragmentShaderTest,
    uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true
});

const materialShader = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSimpleTest,
    fragmentShader: fragmentShaderSimpleTest,
    uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true
});



gui.add(materialShader.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('Frequency X');
gui.add(materialShader.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('Frequency Y');


// Mesh
const mesh = new THREE.Mesh(geometry, materialShader)
scene.add(mesh)

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
camera.position.set(0.25, - 0.25, 1)
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
    const elapsedTime = clock.getElapsedTime();

    // Update shader data
    materialTest.uniforms.uTime.value = elapsedTime;
    materialShader.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
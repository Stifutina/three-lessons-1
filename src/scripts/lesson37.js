import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from '/shaders/particles-cursor/vertex.glsl'
import particlesFragmentShader from '/shaders/particles-cursor/fragment.glsl'


/** CHEATS: */
// https://simon.html5.org/dump/

// html5-canvas-cheat-s



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

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
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Displacement
const displacement = {};

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio);




// 2D Canvas for DEBUG
displacement.canvas = document.createElement('canvas');
displacement.canvas.width = 128;
displacement.canvas.height = 128;
// displacement.canvas.style.position = 'fixed';
// displacement.canvas.style.width = '256px';
// displacement.canvas.style.height = '256px';
// displacement.canvas.style.top = '10px';
// displacement.canvas.style.left = '10px';
// displacement.canvas.style.border = '1px solid white';

displacement.context = displacement.canvas.getContext('2d'); // << creates a 2D context for the canvas

// document.body.appendChild(displacement.canvas); // not necessary, but useful to see the canvas

displacement.context.fillStyle = 'black';
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height);



displacement.glowImage = new Image();
displacement.glowImage.src = '/particles/glow.png';

// Interactive plane
displacement.interactivePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
scene.add(displacement.interactivePlane);
displacement.interactivePlane.visible = false;
displacement.interactivePlane.material.side = THREE.DoubleSide;

// Raycaster
displacement.raycaster = new THREE.Raycaster();

// Coordinates
displacement.screenCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursor = new THREE.Vector2(9999, 9999);
displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999);

window.addEventListener('pointermove', (event) => {
    displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
    displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

displacement.texture = new THREE.CanvasTexture(displacement.canvas);




/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)
const particlesPicture = textureLoader.load('/particles/cat.jpg');
const intesitiesArray = new Float32Array(particlesGeometry.attributes.position.count);
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count);

particlesGeometry.setIndex(null);
particlesGeometry.deleteAttribute('normal');

for (let i = 0; i < intesitiesArray.length; i++) {
    intesitiesArray[i] = Math.random(); 
    anglesArray[i] = Math.random() * 2 * Math.PI;
}

particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intesitiesArray, 1));
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1));

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPicture: new THREE.Uniform(particlesPicture),
        uDisplacementTexture: new THREE.Uniform(displacement.texture),
        uTime: new THREE.Uniform(0.0)
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)




/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Update time uniform for wobble animation
    particlesMaterial.uniforms.uTime.value = elapsedTime
    
    // Update controls
    controls.update()

    /**
     * Raycaster
     */
    displacement.raycaster.setFromCamera(displacement.screenCursor, camera);

    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane);

    if (intersections.length > 0) {
        const uv = intersections[0].uv;

        displacement.canvasCursor.x = uv.x * displacement.canvas.width;
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height;
    }

    /**
     * Displacement
     * handle glow image moving with fading effect
     */
    displacement.context.globalCompositeOperation = 'source-over';
    displacement.context.globalAlpha = 0.02;
    displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height);

    /**
     * Speed alpha
     */
    const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor);
    const alpha = Math.min(cursorDistance * 0.1, 1);
    displacement.canvasCursorPrevious.copy(displacement.canvasCursor);

    /**
     * Draw glow
     */
    const glowSize = displacement.canvas.width * 0.25;

    displacement.context.globalCompositeOperation = 'lighten';
    displacement.context.globalAlpha = alpha;
    displacement.context.drawImage(
        displacement.glowImage, 
        displacement.canvasCursor.x - glowSize / 2, 
        displacement.canvasCursor.y - glowSize / 2, 
        glowSize, glowSize
    );

    displacement.texture.needsUpdate = true;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main () {
    // Scale and animate
    vec2 smokeUv = vUv;

    smokeUv.x *= 0.5; // Scale down the texture
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.04; // Animate the texture over time

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r;

    // Remap
    smoke = smoothstep(0.4, 1.0, smoke); // Adjust the range for a more subtle effect

    // Blur edges
    smoke *= smoothstep(0.0, 0.2, vUv.x);
    smoke *= smoothstep(1.0, 0.8, vUv.x);
    smoke *= smoothstep(1.0, 0.8, vUv.y);
    smoke *= smoothstep(0.0, 0.9, vUv.y);

    // Set the color of the fragment
    gl_FragColor = vec4(1.0, 1.0, 1.0, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
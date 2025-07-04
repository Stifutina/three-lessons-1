uniform sampler2D uTexture;
uniform vec3 uColor; // Color of the firework

void main() {
    // Final color of the pixel
    float textureAlpha = texture(uTexture, gl_PointCoord).r;

    gl_FragColor = vec4(uColor, textureAlpha); // Orange color

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
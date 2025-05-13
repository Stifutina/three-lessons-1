varying vec3 vColor;

void main() {
    // Disc

    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = smoothstep(0.5, 0.1, strength);

    // Diffuse
    // float strength = distance(gl_PointCoord, vec2(0.5)); // distance from center
    // strength *= 2.0; // scale to [0, 2]
    // strength = 1.0 - strength;

    // Light point
    float strength = distance(gl_PointCoord, vec2(0.5)); // distance from center
    strength = 1.0 - strength; // invert
    strength = pow(strength, 10.0); // square

    // Final color
    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}
uniform float uTime;
varying vec3 vNormal;

varying vec3 vPosition;

float random2D(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main () {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch effect
    float glitchTime = uTime - modelPosition.y; // Adjust the speed of the glitch effect
    float glitchStrngth = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76); // Adjust the strength of the glitch effect

    glitchStrngth /= 3.0; // Normalize the glitch strength to avoid extreme values

    glitchStrngth = smoothstep(0.3, 1.0, glitchStrngth); // Smooth the glitch strength to avoid abrupt changes

    glitchStrngth *= 0.25;

    modelPosition.x += (random2D(modelPosition.xy + (uTime * 0.01)) - 0.5) * glitchStrngth; // Random horizontal offset
    modelPosition.z += (random2D(modelPosition.zx + (uTime * 0.01)) - 0.5) * glitchStrngth; // Random horizontal offset

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}
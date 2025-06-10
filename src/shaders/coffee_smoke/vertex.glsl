uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

vec2 rotate2DMatrix(vec2 v, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    
    mat2 m2 = mat2(
        c, -s,
        s, c
    );
    return m2 * v;
}

vec2 rotate2D(vec2 v, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(
        c * v.x - s * v.y,
        s * v.x + c * v.y
    );
}

void main() {
    float smokePerlin = texture(uPerlinTexture, vec2(0.5, uv.y * 0.1)).r * 2.0;
    float windPerlinX = texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r;
    float windPerlinZ = texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r;
    vec3 newPosition = position;

    float angle = newPosition.y * smokePerlin + uTime * 0.3; // Adjust the angle based on the y position and time

    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    vec2 windOffset = vec2(
        windPerlinX - 0.5, 
        windPerlinZ - 0.5
    );

    // make some curve to the wind
    windOffset *= pow(uv.y, 3.0) * 5.0;

    newPosition.xz += windOffset;

    // Final position of the vertex
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    // Pass the UV coordinates to the fragment shader
    vUv = uv;
}
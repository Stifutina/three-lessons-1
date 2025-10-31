uniform float uBigWaveElevation;
uniform vec2 uBigWaveFrequency;
uniform float uTime;
uniform float uBigWaveSpeed;

uniform float uSmallWaveElevation;
uniform float uSmallWaveFrequency;
uniform float uSmallWaveSpeed;
uniform float uSmallWaveIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include <fog_pars_vertex>
#include 'includes/perlinClassic3d.glsl'

float waveElevation(vec3 position) {
    float elevation = perlinClassic3D(vec3(position.xz * uBigWaveFrequency, uTime * uBigWaveSpeed)) * uBigWaveElevation;

    for (float i = 1.0; i < uSmallWaveIterations; i++) {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWaveFrequency * i, uTime * uSmallWaveSpeed)) * uSmallWaveElevation / i);
    }

    return elevation;
}

void main() {
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>

    float shift = 0.01;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Using neighboring vertices tecnique to calculate correct normal
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0); // Neighboring vertex slightly offset
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift); // Neighboring vertex slightly offset

    float elevation = waveElevation(modelPosition.xyz);
    // Apply elevation to the main vertex and its neighbors
    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    // Compute normals
    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 computeNormal = cross(toA, toB); // Compute the normal using cross product

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vElevation = elevation;
    vNormal = computeNormal;
    vPosition = modelPosition.xyz;
}
precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.z = sin(modelPosition.x * 10.0) * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
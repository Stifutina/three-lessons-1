precision mediump float;

varying vec2 vUv;
varying float vRandom;

void main() {
    gl_FragColor = vec4(vUv, vRandom * 0.4, 1.0);
}
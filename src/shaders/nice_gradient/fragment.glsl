precision mediump float;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(vUv, 0.1, 1.0);
}
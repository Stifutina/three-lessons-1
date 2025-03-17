precision mediump float;

varying vec2 vUv;
varying float vElevation;

void main() {
    vec4 textureColor = vec4(vUv, 0.4, 1.0);

    textureColor.rgb *= vElevation * 2.0 + 0.8;

    gl_FragColor = textureColor;
}
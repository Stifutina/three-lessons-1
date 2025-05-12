uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

#include <fog_pars_fragment>

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    vec3 colorWithFoam = mix(color, vec3(1.0, 1.0, 1.0), smoothstep(0.0, 0.2, vElevation + 0.02));

    gl_FragColor = vec4(colorWithFoam, 1.0); // Set the fragment color to a blue shade


    #include <fog_fragment>
}
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include <fog_pars_fragment>


#include 'includes/ambientLight.glsl'
#include 'includes/directionalLight.glsl'
#include 'includes/pointLight.glsl'

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    // Light
    vec3 light = vec3(0.0);

    light += directionalLight(
        vec3(1.0), // lightColor
        5.0, // intensity
        normal,
        vec3(0.0, 10.5, 0.0),
        viewDirection,
        30.0 // specular
    );

    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, smoothstep(0.0, 1.0, mixStrength));

    color *= light;
    
    vec3 brightSurfaceColor = min(uSurfaceColor * 10.0, vec3(1.0)); // brighten
    vec3 saturatedSurfaceColor = mix(vec3(dot(brightSurfaceColor, vec3(0.299, 0.687, 0.114))), brightSurfaceColor, 1.5); // saturate

    vec3 colorWithFoam = mix(color, saturatedSurfaceColor, smoothstep(0.03, 0.1, vElevation + 0.01));

    gl_FragColor = vec4(colorWithFoam, 1.0); // Set the fragment color to a blue shade


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
}
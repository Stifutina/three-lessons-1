uniform vec3 uColor;
uniform vec2 uResolution;
uniform vec3 uShadeColor;
uniform vec3 uLightColor;
uniform float uShadowRepeitions;
uniform float uLightRepeitions;
varying vec3 vNormal;
varying vec3 vPosition;

#include includes/ambientLight.glsl
#include includes/directionalLight.glsl

vec3 halftone(vec3 color, float repetitions, vec3 direction, float low, float high, vec3 pointColor, vec3 normal) {
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    // Halftone effect
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv = mod(uv * repetitions, 1.0);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

    // Mix colors
    return mix(color, pointColor, point);
}

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);

    light += ambientLight(
        vec3(1.0), // light color
        1.0        // intensity
    );

    light += directionalLight(
        vec3(1.0),          // light color
        1.0,                // intensity
        normal,
        vec3(1.0, 1.0, 1.0),
        viewDirection,
        1.0
    );

    color *= light;

    // add shadow
    color = halftone(color, uShadowRepeitions, vec3(0.0, -1.0, 0.0), -0.8, 1.3, uShadeColor, normal);
    // add light
    color = halftone(color, uLightRepeitions, vec3(0.0, 1.0, 0.0), 0.4, 1.3, uLightColor, normal);

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
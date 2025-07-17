uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

#include 'includes/ambientLight.glsl'
#include 'includes/directionalLight.glsl'
#include 'includes/pointLight.glsl'

void main()
{
    vec3 normal = normalize(vNormal); // Normalize the normal vector to avoid lighting artifacts
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 color = uColor;

    // Light
    vec3 light = vec3(0.0);

    light += ambientLight(vec3(1.0), 0.1); // Ambient light effect
    light += directionalLight(
        vec3(0.1, 0.1, 1.0), // light color
        1.0,  // light intensity
        normal, // normal
        vec3(0.0, 0.0, 3.0), // light position
        viewDirection, // view direction
        32.0 // specular power
    ); // Directional light effect
    light += pointLight(
        vec3(1.0, 0.5, 0.5), // light color
        1.0,  // light intensity
        normal, // normal
        vec3(0.0, 2.5, 0.0), // light position
        viewDirection, // view direction
        32.0, // specular power
        vPosition, // Position
        0.3 // light decay
    ); // Point light effect
    light += pointLight(
        vec3(0.1, 1.0, 0.5), // light color
        1.0,  // light intensity
        normal, // normal
        vec3(2.5, 0.2, -4.0), // light position
        viewDirection, // view direction
        32.0, // specular power
        vPosition, // Position
        0.2 // light decay
    ); // Point light effect

    // Apply light to color
    color *= light;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
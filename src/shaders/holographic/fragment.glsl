uniform float uTime;
uniform vec3 uColor;
varying vec3 vPosition;
varying vec3 vNormal;

void main () {
    // Stripes
    vec3 normal = normalize(vNormal); // Normalize the normal vector to ensure consistent lighting calculations

    if (!gl_FrontFacing) {
        normal *= -1.0; // Invert the normal if the fragment is front-facing
    }

    float stripe = mod((vPosition.y - (uTime * 0.2)) * 20.0, 1.0);

    stripe = pow(stripe, 3.0); // Adjust the sharpness of the stripes

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition); // Assuming cameraPosition is defined in the shader. Normalize the vector from the camera to the fragment
    float fresnel = dot(viewDirection, normal) + 1.0; // Dot returns 1 when the normal and view direction are aligned, 0 when they are perpendicular

    fresnel = pow(fresnel, 2.0); // Adjust the power to control the intensity of the fresnel effect

    // Falloff
    float falloff = smoothstep(0.8, 0.0, fresnel); // Smooth step to create a falloff effect

    // Holographic effect
    float holographic = stripe * fresnel; // Combine the stripe and fresnel effects

    // holographic += fresnel - falloff; // Adjust the base brightness of the holographic effect
    holographic += fresnel * 1.25; // Adjust the base brightness of the holographic effect
    holographic *= falloff; // Apply the falloff to the holographic effect


    // final color output
    gl_FragColor = vec4(uColor, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
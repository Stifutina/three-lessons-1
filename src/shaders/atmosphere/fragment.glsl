varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform vec3 uAtmophereDayColor;
uniform vec3 uAtmophereNightColor;



/**
 * Apply atmospheric glow effect (Fresnel)
 */
vec3 applyAtmosphere(vec3 baseColor, vec3 atmosphereColor, float atmosphereFresnel, float dayMix) {
    return mix(baseColor, atmosphereColor, atmosphereFresnel * dayMix);
}


void main()
{
    // Initialize vectors
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);
    
    // Calculate sun orientation for day/night transition
    float sunOrientation = dot(uSunDirection, normal);
    float dayMix = smoothstep(-0.25, 1.5, sunOrientation);
    
    // Calculate atmosphere properties
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmophereNightColor, uAtmophereDayColor, atmosphereDayMix);
    float fresnel = dot(viewDirection, normal);
    
    // Edge alpha
    float edgeAlpha = fresnel;
    edgeAlpha = smoothstep(0.0, 0.25, edgeAlpha);

    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    float alpha = edgeAlpha * dayAlpha;

    // Build final color step by step
    color = applyAtmosphere(color, atmosphereColor, fresnel, dayMix);

    // Output final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
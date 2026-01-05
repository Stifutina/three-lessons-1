varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform sampler2D uNormalTexture;
uniform vec3 uAtmophereDayColor;
uniform vec3 uAtmophereNightColor;

/**
 * Calculate perturbed normal from normal map
 */
vec3 getBumpedNormal(vec3 normal, vec2 uv, vec3 position) {
    // Sample normal map
    vec3 normalMap = texture(uNormalTexture, uv).rgb;
    normalMap = normalMap * 2.0 - 1.0; // Convert from [0,1] to [-1,1]
    
    // Construct tangent space basis for sphere
    vec3 Q1 = dFdx(position);
    vec3 Q2 = dFdy(position);
    vec2 st1 = dFdx(uv);
    vec2 st2 = dFdy(uv);
    
    vec3 N = normalize(normal);
    vec3 T = normalize(Q1 * st2.t - Q2 * st1.t);
    vec3 B = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);
    
    // Transform normal from tangent space to world space
    return normalize(TBN * normalMap);
}

/**
 * Mix day and night textures based on sun orientation
 */
vec3 getDayNightColor(vec2 uv, float dayMix) {
    vec3 dayColor = texture(uDayTexture, uv).rgb;
    vec3 nightColor = texture(uNightTexture, uv).rgb;
    return mix(nightColor, dayColor, dayMix);
    // return vec3(0.5);
}

/**
 * Apply clouds layer with smooth blending
 */
vec3 applyClouds(vec3 baseColor, float cloudValue, float dayMix) {
    float cloudsMix = smoothstep(0.3, 1.0, cloudValue);
    cloudsMix *= dayMix; // Clouds visible only during the day
    return mix(baseColor, vec3(1.0), cloudsMix);
}

/**
 * Apply atmospheric glow effect (Fresnel)
 */
vec3 applyAtmosphere(vec3 baseColor, vec3 atmosphereColor, float atmosphereFresnel, float dayMix) {
    return mix(baseColor, atmosphereColor, atmosphereFresnel * dayMix);
}

/**
 * Apply bump map lighting for terrain relief
 */
vec3 applyBumpLighting(vec3 baseColor, vec3 bumpedNormal, vec3 smoothNormal) {
    // Calculate base lighting with smooth normal
    float baseLight = dot(uSunDirection, smoothNormal);
    
    // Calculate bump lighting with perturbed normal
    float bumpLight = dot(uSunDirection, bumpedNormal);
    
    // The difference creates terrain detail
    float terrainDetail = (bumpLight - baseLight) * 10.0;
    
    // Apply detail as additive/subtractive lighting
    return baseColor * (1.0 + terrainDetail);
}

/**
 * Enhance saturation on sun-lit areas
 */
vec3 applySunlitSaturation(vec3 color, float sunOrientation) {
    // Calculate saturation boost based on sun exposure
    float sunStrength = smoothstep(-0.2, 0.6, sunOrientation);
    
    // Convert to grayscale (luminance)
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Interpolate between grayscale and full color based on sun strength
    // More sun = more saturated
    float saturationBoost = 1.0 + sunStrength * 0.4;
    return mix(vec3(luminance), color, saturationBoost);
}

vec3 applySpecularReflection(vec3 color, vec3 normal, vec3 viewDirection, vec3 atmosphereColor, float atmosphereFresnel, float specularMask) {
    vec3 reflection = reflect( - uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 36.0);
    specular *= specularMask; // Modulate by cloud specular map

    vec3 specularColor = mix(vec3(1.0), atmosphereColor, atmosphereFresnel);

    return color + specular * specularColor;
}

void main()
{
    // Initialize vectors
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    
    // Calculate sun orientation for day/night transition
    float sunOrientation = dot(uSunDirection, normal);
    float dayMix = smoothstep(-0.25, 1.5, sunOrientation);
    
    // Get bumped normal for terrain detail
    vec3 bumpedNormal = getBumpedNormal(normal, vUv, vPosition);
    
    // Sample specular/clouds texture
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;
    
    // Calculate atmosphere properties
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmophereNightColor, uAtmophereDayColor, atmosphereDayMix);
    float atmosphereFresnel = pow(dot(viewDirection, normal) + 1.0, 1.0);
    
    // Build final color step by step
    vec3 color = getDayNightColor(vUv, dayMix);
    color = applyClouds(color, specularCloudsColor.g, dayMix);
    color = applyAtmosphere(color, atmosphereColor, atmosphereFresnel, dayMix);
    color = applyBumpLighting(color, bumpedNormal, normal);
    color = applySunlitSaturation(color, sunOrientation);
    color = applySpecularReflection(color, normal, viewDirection, atmosphereColor, atmosphereFresnel, specularCloudsColor.r);

    // Output final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
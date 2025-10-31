vec3 pointLight(vec3 lightColor, float intensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {
    vec3 lightDelta = lightPosition - position;
    float lightDistance = length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection = reflect(-lightDirection, normal);

    // Shading
    float shading = max(dot(normal, lightReflection), 0.0);

    // Specular
    float specular = pow(max(-dot(viewDirection, lightReflection), 0.0), specularPower);

    // Decay
    float decay = max(1.0 - lightDistance * lightDecay, 0.0);

    return lightColor * intensity * (shading + specular) * decay;
}
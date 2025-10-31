
vec3 directionalLight(vec3 lightColor, float intensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower) {
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(-lightDirection, normal);

    // Shading
    float shading = max(dot(normal, lightReflection), 0.0);

    // Specular
    float specular = pow(max(-dot(viewDirection, lightReflection), 0.0), specularPower);

    return lightColor * intensity * (shading + specular);
}
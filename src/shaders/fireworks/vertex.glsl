uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;


attribute float aSize; // Size of each point set as the geometry attribute
attribute float aTimeMultiplier; // Time multiplier for each point

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {
    float progress = uProgress * aTimeMultiplier; // Apply the time multiplier to the progress
    vec3 newPosition = position;

    // Expolsion effect
    float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);

    explodingProgress = clamp(explodingProgress, 0.0, 1.02); // Ensure the progress is between 0 and 1
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0); // Exponential easing for a more dramatic effect
    newPosition *= explodingProgress; // Scale the position based on the explosion progress

    // Falling down
    float fallingProgress = remap(progress, 0.1, 1.2, 0.0, 1.0);

    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0); 

    newPosition.y -= fallingProgress * 0.2; // Move the point down based on the falling progress


    // Scaling
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);

    sizeProgress = clamp(sizeProgress, 0.0, 1.0);


    // Twinckling effect
    float twincklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twincklingProgress = clamp(twincklingProgress, 0.0, 1.0);
    float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5; // Sinusoidal twinkling effect
    sizeTwinkling = 1.0 - sizeTwinkling * twincklingProgress; // Apply the size progress to the twinkling effect


    // Final position of the vertex in clip space
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    // Final size
    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling; // FOV is vertical, so we use height for size scaling

    // Perspective by Z
    gl_PointSize *= 1.0 / -viewPosition.z;

    if (gl_PointSize < 1.0) {
        gl_Position = vec4(9999.99);
    }
}
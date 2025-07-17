uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
attribute vec3 aPositionTarget;
attribute float aSize;
attribute float aRandom;
uniform float uTime;

varying vec3 vColor;

#include includes/simplexNoise3d.glsl

void main()
{
    // Mixed Position
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, uProgress);

    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // Final position 
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;


    // Calculate brounian effect multiplier
    // and apply it to gl_Position
    gl_Position = projectedPosition;

    // float angle = (uTime * 0.6 + noise * 50.0) + aRandom * 3.1415926;
    float angle = mod(uTime * 0.9, 6.2831853) - 3.1415926 + aRandom * 6.2831853;
    float radius = aRandom * 0.15;
    gl_Position.xy += vec2(cos(angle), sin(angle)) * radius;


    // Point size
    gl_PointSize =  aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    gl_Position.z += cos(angle) * radius;

    // Varying color
    vColor = vec3(noise);
}
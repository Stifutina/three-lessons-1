uniform vec2 uResolution;
uniform sampler2D uPicture;
uniform sampler2D uDisplacementTexture;
uniform float uTime;

varying vec3 vColor;
attribute float aIntensity;
attribute float aAngle;

void main()
{

    vec3 newPosition = position;
    
    // Random wobble using sin functions with per-particle variation
    float wobbleSpeed = 0.5 + aIntensity * 0.5; // Vary speed per particle
    float wobblePhase = aAngle; // Use angle as phase offset for uniqueness
    float wobbleAmount = 0.05 * aIntensity; // Vary intensity per particle
    
    vec3 wobble = vec3(
        sin(uTime * wobbleSpeed + wobblePhase) * wobbleAmount,
        cos(uTime * wobbleSpeed * 1.3 + wobblePhase * 2.0) * wobbleAmount,
        sin(uTime * wobbleSpeed * 0.7 + wobblePhase * 1.5) * wobbleAmount * 0.5
    );
    newPosition += wobble;
    
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, 0.6, displacementIntensity);
    vec3 displacement = vec3(
        cos(aAngle),
        sin(aAngle),
        1.0
    );
    displacement = normalize(displacement);
    displacement *= displacementIntensity * 2.0 * aIntensity;
    newPosition += displacement;


    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Picture
    float pictureIntensity = texture(uPicture, uv).r;

    // Point size
    gl_PointSize = 0.07 * uResolution.y * pictureIntensity;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = vec3(pow(pictureIntensity, 2.0)) * vec3(pow(uv.x, -2.0), pow(uv.y, 2.0), uv.y * uv.x);
}
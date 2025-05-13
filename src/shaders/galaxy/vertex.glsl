uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandom;

varying vec3 vColor;

void main()
{
    /** Position */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);


    /** Spin */
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;

    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    modelPosition.xyz += aRandom;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectPosition = projectionMatrix * viewPosition;

    gl_Position = projectPosition;

    /** Size */
    gl_PointSize = uSize * aScale;

    /** Size atttenuation */
    gl_PointSize *= 1.0 / -viewPosition.z;

    /** Color */
    vColor = color;
}
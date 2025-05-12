varying vec2 vUv;

// vUv in THREE js looks like that:
// ----------------------------------
// | 0.0, 1.1 | 0.5, 1.1 | 1.1, 1.1 |
// ----------------------------------
// | 0.0, 0.5 | 0.5, 0.5 | 1.1, 0.5 |
// ----------------------------------
// | 0.0, 0.0 | 0.5, 0.0 | 1.1, 0.0 |
// ----------------------------------
//
// The values are normalized between 0.0 and 1.0

#define PI 3.14159265359

// there is no random function in GLSL, so we have to create one:
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(
        cos(rotation) * (uv.x - mid.x) - sin(rotation) * (uv.y - mid.y) + mid.x,
        sin(rotation) * (uv.x - mid.x) + cos(rotation) * (uv.y - mid.y) + mid.y
    );
}





//
// GLSL textureless classic 2D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-08-22
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}




void main()
{
    // Black&White pattern 1
    // float strength = vUv.x;

    // Black&White pattern 2
    // float strength = vUv.y;

    // Black&White pattern 3
    // float strength = 1.0 - vUv.y;

    // Black&White pattern 4
    // float strength = vUv.y * 8.0;

    // Black&White pattern 5
    // float strength = mod(vUv.y * 8.0, 1.0); // mod returns vUv.y * 8.0 if vUv.y * 8.0 < 1.0, otherwise returns the remainder of vUv.y * 8.0 divided by 1.0 
    // Example: mod(0.5 * 8.0, 1.0) = 0.0;

    // Black&White pattern 6
    // float strength = mod(vUv.y * 8.0, 1.0);
    // (strength < 0.5) ? strength = 0.0 : strength = 1.0; // step does the same thing >>
    // strength = step(0.5, strength);

    // Black&White pattern 7
    // float strength = mod(vUv.y * 8.0, 1.0);
    // (strength < 0.5) ? strength = 0.0 : strength = 1.0; // step does the same thing >>
    // strength = step(0.8, strength);

    // Black&White pattern 8
    // float strength = mod(vUv.x * 8.0, 1.0);
    // (strength < 0.5) ? strength = 0.0 : strength = 1.0; // step does the same thing >>
    // strength = step(0.8, strength);

    // Black&White pattern 9
    // float strength = step(0.8, mod(vUv.x * 8.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 8.0, 1.0));

    // Black&White pattern 10
    // float strength = step(0.8, mod(vUv.x * 8.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 8.0, 1.0));

    // Black&White pattern 11
    // float strength = step(0.3, mod(vUv.x * 8.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 8.0, 1.0));

    // Black&White pattern 12
    // float barX = step(0.4, mod(vUv.x * 8.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 8.0, 1.0));
    // float barY = step(0.8, mod(vUv.x * 8.0, 1.0));
    // barY *= step(0.4, mod(vUv.y * 8.0, 1.0));

    // float strength = barX + barY;

    // Black&White pattern 13
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

    // float strength = barX + barY;

    // Black&White pattern 14
    // float strength = abs(vUv.x - 0.5); // from 0.5 to 0.0 to 0.5 instead of -0.5 to 0.0 to 0.5

    // Black&White pattern 15
    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // Black&White pattern 16
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // Black&White pattern 17
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    // Black&White pattern 18
    // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float strength = square1 * square2;

    // Black&White pattern 19
    // float strength = floor(vUv.x * 10.0) / 10.0;

    // Black&White pattern 20
    // float strength = floor(vUv.x * 10.0) / 10.0;
    // strength *= floor(vUv.y * 10.0) / 10.0;

    // Black&White pattern 21
    // float strength = random(vUv);

    // Black&White pattern 22
    // vec2 gridUv = vec2(floor(vUv.x * 10.0), floor(vUv.y * 10.0));
    // float strength = random(gridUv);

    // Black&White pattern 23
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0,
    //     floor((vUv.y + vUv.x * 0.5) * 10.0) / 10.0
    // );
    // float strength = random(gridUv);

    // Black&White pattern 24
    // float strength = sqrt(vUv.x*vUv.x + vUv.y*vUv.y); // length() function does the same >>
    // float strength = length(vUv);

    // Black&White pattern 25
    // float strength = length(vUv - 0.5); // the same:
    // float strength = distance(vUv, vec2(0.2, 0.8));

    // Black&White pattern 26
    // float strength = length(vUv - 0.5); // the same:
    // float strength = 1.0 - distance(vUv, vec2(0.5));

    // Black&White pattern 27
    // star effect !!!
    // float strength = 0.02 / distance(vUv, vec2(0.5));

    // Black&White pattern 28
    // vec2 newUv = vec2(
    //     vUv.x * 0.1 + 0.45,
    //     vUv.y * 0.5 + 0.25
    // );
    // float strength = 0.02 / distance(newUv, vec2(0.5));

    // Black&White pattern 29
    // STAR
    // vec2 lightUvX = vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25);
    // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
    // vec2 lightUvY = vec2(vUv.x * 0.5 + 0.25, vUv.y * 0.1 + 0.45);
    // float lightY = 0.015 / distance(lightUvY, vec2(0.5));
    // float strength = lightX * lightY;

    // Black&White pattern 30
    // STAR
    // vec2 rotateUv = rotate(vUv, PI/4.0, vec2(0.5));
    // vec2 lightUvX = vec2(rotateUv.x * 0.1 + 0.45, rotateUv.y * 0.5 + 0.25);
    // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
    // vec2 lightUvY = vec2(rotateUv.x * 0.5 + 0.25, rotateUv.y * 0.1 + 0.45);
    // float lightY = 0.015 / distance(lightUvY, vec2(0.5));
    // float strength = lightX * lightY;


    // Black&White pattern 31
    // float strength = step(0.3, distance(vUv, vec2(0.5)));


    // Black&White pattern 32
    // float strength = abs(distance(vUv, vec2(0.5)) - 0.3);

    // Black&White pattern 33
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.3));

    // Black&White pattern 34
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.3));

    // Black&White pattern 35
    // vec2 wavedUv = vec2(
    //     vUv.x,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.3));

    // Black&White pattern 36
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 30.0) * 0.1,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // Black&White pattern 37
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 300.0) * 0.1,
    //     vUv.y + sin(vUv.x * 300.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // Black&White pattern 38
    // float angle = atan(vUv.x, vUv.y);
    // float strength = angle;

    // Black&White pattern 39
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;


    // Black&White pattern 40
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = angle;

    // Black&White pattern 41
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // angle *= 20.0; 
    // angle = mod(angle, 1.0);
    // float strength = angle;

    // Black&White pattern 42
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = sin(angle * 100.0);

    // Black&White pattern 43
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float radius = sin(angle * 50.0);
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius * 0.2));

    // Black&White pattern 44
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float radius = sin(angle * 100.0);
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - (0.25 + radius * 0.02)));

    // Black&White pattern 45
    // float strength = cnoise(vUv * 10.0);

    // Black&White pattern 46
    // float strength = step(0.2, cnoise(vUv * 10.0));

    // Black&White pattern 47
    // float strength = 1.0 - abs(cnoise(vUv * 10.0));

    // Black&White pattern 48
    // float strength = sin(cnoise(vUv * 10.0) * 20.0);

    // Black&White pattern 49
    // float strength = step(0.95, sin(cnoise(vUv * 10.0) * 20.0));

    // Black&White pattern 50
    float strength = step(0.95, sin(cnoise(vUv * 10.0) * 20.0));


    // gl_FragColor = vec4(sin(vUv.x), sin(vUv.y), 1.0, 1.0);
    // gl_FragColor = vec4(vUv, 1.0, 1.0);
    // gl_FragColor = vec4(1.0, vUv.x, vUv.y, 1.0);
    // gl_FragColor = vec4(vUv, 0.0, 1.0);


    // Clamp the strength
    strength = clamp(strength, 0.0, 1.0);

    // Colored version
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, 1.0);
    vec3 mixedColor = mix(blackColor, uvColor, strength);
    gl_FragColor = vec4(mixedColor, 1.0);

    // Black & White version
    // gl_FragColor = vec4(strength, strength, strength, 1.0);
}
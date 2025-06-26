uniform vec3 iResolution;
uniform float iTime;

varying vec2 vUv;

/*
    "Accretion" by @XorDev
    
    I discovered an interesting refraction effect
    by adding the raymarch iterator to the turbulence!
    https://x.com/XorDev/status/1936884244128661986
*/

void mainImage(out vec4 O, vec2 I)
{
    //Raymarch depth
    float z,
    //Step distance
    d,
    //Raymarch iterator
    i;
    //Clear fragColor and raymarch 100 steps
    for(O*=i; i++<2e1; )
    {
        //Sample point (from ray direction)
        vec3 p = z*normalize(vec3(I+I,0)-iResolution.xyx)+.1;
        
        //Polar coordinates and additional transformations
        p = vec3(atan(p.y/.2,p.x)*2., p.z/3., length(p.xy)-5.-z*.2);
        
        //Apply turbulence and refraction effect
        for(d=0.; d++<7.;)
            p += sin(p.yzx*d+iTime+.3*i)/d;
            
        //Distance to cylinder and waves with refraction
        z += d = length(vec4(.4*cos(p)-.4, p.z));
        
        //Coloring and brightness
        O += (1.+cos(p.x+i*.4+z+vec4(6,1,2,0)))/d;
    }
    //Tanh tonemap
    O = tanh(O*O/4e2);
}

void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec4 color = vec4(0.0);
    mainImage(color, fragCoord);
    gl_FragColor = color;
}

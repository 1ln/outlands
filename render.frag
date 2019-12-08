//Signed Distance Renderer using raymarching
//Copyright 2019, Dan Olson

precision mediump float;

varying vec2 vUv;
varying vec2 vtc;

//uniform mat4 viewMatrix;
//uniform mat4 cameraWorldMatrix;
//uniform mat4 cameraProjectionMatrixInverse;
//uniform vec3 cameraPosition;

uniform float u_hash;

uniform vec2 u_mouse;
uniform int u_mouse_pressed;
uniform int u_swipe_dir;

uniform vec2 u_resolution;

uniform vec3 u_cam_target;
uniform float u_time;

uniform vec3 u_light;
uniform vec3 u_rot_light;

uniform int u_df;
uniform int u_df2;

uniform sampler2D u_texture;

uniform int u_repeat;

uniform float u_repeat_dist;
uniform vec3 u_repeat_dir;

uniform int u_octaves;

uniform float u_cell_iterations;
uniform int u_cell_dist_type;

uniform float u_eps;
uniform float u_trace_dist;

uniform vec3 u_diffuse_col;
uniform vec3 u_ambient_col;
uniform vec3 u_specular_col;
uniform vec3 u_background_col;

uniform float u_shininess;
uniform float u_intensity;
uniform float u_rot_light_intensity;

uniform vec3 u_diffuse_b;
uniform vec3 u_diffuse_c;
uniform vec3 u_diffuse_d;

uniform int u_diffuse_noise;

const float PI  =  3.1415926;
const float PI_2 = 2.0 * PI;
const float PI6 = 6.0 * PI;
const float PI_6 = 6.0/PI;
const float PHI =  1.6180339;
const float PHI_INV = 1.0/PHI;
const float PHI_SPHERE = 1.0 - PHI/6.0;

const int MARCH_STEPS = 64;

const float EPSILON = 0.0001;
const float TRACE_DIST = 1000.0;

//float hash(float h) { return fract( h * u_hash ); }
float hash(float h) { return fract(sin(h) * u_hash *  43758.5453 ); }


//float hash(float h) { 
//return fract(PHI/log(23324.0 ) * h  * 981123324.0  );
//}

//2D Hash Functions
float rand2d(vec2 st) {
return fract(sin(dot(st.xy,vec2(12.9898,78.233))) * 43758.5453123) * 2.0 - 1.0 ;
}

//2D Noise functions

float noise2d(in vec2 st_) {

    vec2 i = floor(st_);
    vec2 f = fract(st_);

float a = rand2d(i);
    float b = rand2d(i + vec2(1.0,0.0));
    float c = rand2d(i + vec2(0.0,1.0));
    float d = rand2d(i + vec2(1.0,1.0));
 
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a,b,u.x) + 
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

//3D Hash Functions

vec3 hash3(vec3 x) {
 
    x = vec3(dot(x,vec3(45.0,325.0,2121.455)), 
             dot(x,vec3(122.34,109.0,592.0)),
             dot(x,vec3(67.0,322.4364,1235.0)));

    return fract(sin(x) * 92352.3635 * u_hash);
}

//3D Noise Functions

float sin3(vec3 p) {
    return sin(p.x * u_hash) * sin(p.y * u_hash) * sin(p.z * u_hash);
} 
 
float cell(vec3 x) {
 
    x *= u_cell_iterations;

    vec3 p = floor(x);
    vec3 f = fract(x);
 
    float min_dist = 1.0;
    
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            for(int k = -1; k <= 1; k++) { 

                vec3 b = vec3(float(k),float(j),float(i));
                vec3 r = hash3(p + b);
                vec3 diff = (b + r - f);

                float d = length(diff);

                    if(u_cell_dist_type == 0) { 
                        min_dist = min(min_dist,d);
                    }
 
                    if(u_cell_dist_type == 1) {
                        min_dist = min(min_dist,abs(diff.x)+abs(diff.y)+abs(diff.z));
                    }

                    if(u_cell_dist_type == 2) {
                        min_dist = min(min_dist,max(abs(diff.x),max(abs(diff.y),abs(diff.z))));
                    }

            }
        }
    }
 
    return min_dist;  

}

float cellTexture255(vec3 x) {
    
    vec4 tx = texture2D(u_texture,vec2(0.0 ));
    float m_dist = 1.0;
    /*
    for(int i = 0; i < 64; ++i) {
        m_dist = min(m_dist,distance(vec2( x.xy),vec2( mod(float(i),tx.x),mod(float(i+1),tx.x) ))) ;
    }*/
    m_dist = min(m_dist,distance(vec2(x.xy),vec2(.23,.4)));
    m_dist = min(m_dist,distance(vec2(x.xy),vec2(.03,.76)));
    m_dist = min(m_dist,distance(vec2(x.xy),vec2(.443,.26)));
 
    return m_dist;
}

/*
float fb2d(in vec2 st_) {

float value = 0.0; 
float amp = 0.5;

for(int i = 0; i < 6; ++i) {
value += amp * noise2d(st_);
    st_ *= 2.0; 
amp *= 0.5;

}*/ 

//  return value;

float noise3d(vec3 x) {

    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f * f * (3.0 - 2.0 * f);
 
    float n = p.x + p.y * 157.0 + 113.0 * p.z;

    return mix(mix(mix(hash(n + 0.0),hash(n + 1.0),f.x), 
                   mix(hash(n + 157.0),hash(n + 158.0),f.x),f.y),
               mix(mix(hash(n + 113.0),hash(n + 114.0),f.x),
                   mix(hash(n + 270.0),hash(n + 271.0),f.x),f.y),f.z);
} 

mat3 m = mat3(0.0,.8,.6,-.8,.36,-.48,-.6,-.48,.64);
float fractal3(vec3 x) {

    float f = 0.0;
    f = .5 * noise3d(x);
    x = 2.01 * x * m;
    f += .25 * noise3d(x);
    x = 2.02  * x * m;
    f += .125 * noise3d(x);
    x = 2.03 * x * m;
    f += .0625 * noise3d(x);
    x = 2.04 * x * m;
    f += .03125 * noise3d(x);
    x = 2.05 * x * m;
    f += .015625 * noise3d(x);

    return f;

}

float fractal312(vec3 x,int octaves) {

    float value = 0.0;
    float h  = .5;
    float g = exp2(-h); 
    float amp = 0.5;
    float freq = 1.0;

    if(octaves >= 1)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 2)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 3)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 4)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 5)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 6)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; } 
    if(octaves >= 7)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 8)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; } 
    if(octaves >= 9)  { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 10) { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 11) { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }
    if(octaves >= 12) { value += amp * noise3d(freq * x); freq *= 2.0; amp *= g; }

    return value;
}

float distortFractal(vec3 p,float f,int octaves) {
    
    vec3 q = vec3(fractal312(p + vec3(0.0,0.0,1.0),octaves),      
                  fractal312(p + vec3(4.5,1.8,6.3),octaves),
                  fractal312(p + vec3(1.1,7.2,2.4),octaves)
    );

    vec3 r = vec3(fractal312(p + f*q + vec3(2.1,9.4,5.1),octaves),
                  fractal312(p + f*q + vec3(5.6,3.7,8.9),octaves),
                  fractal312(p + f*q + vec3(4.3,0.0,3.1),octaves) 
    ); 

    return fractal312(p + f * r,octaves);
} 

      
//Shaping Functions

float linear(float x) {

    return x;
}

float power(float x,float f) {

    return pow(x,f);
}

float envImpulse(float x,float k) {

    float h = k * x;
    return h * exp(1.0 - h);
}

float envStep(float x,float k,float n) {

    return exp(-k * pow(x,n));
}

float cubicImpulse(float x,float c,float w) {

    x = abs(x - c);
    if( x > w) { return 0.0; }
    x /= w;
    return 1.0 - x * x  * (3.0 - 2.0 * x);

}

float sincPhase(float x,float k) {

    float a = PI * (k * x - 1.0);
    return sin(a)/a;
}

vec3 fmCol(float t,vec3 a,vec3 b,vec3 c,vec3 d) {
    
    return a + b * cos(PI_2*(c*t+d));
}

//Rotation,translation,scale

mat4 rotationAxis(vec3 axis,float theta) {

axis = normalize(axis);

    float c = cos(theta);
    float s = sin(theta);

    float oc = 1.0 - c;

    return mat4( 
        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
        0.0,0.0,0.0,1.0);

}

mat4 translate(vec3 p) {
 
    return mat4(
        vec4(1,0,0,p.x),
        vec4(0,1,0,p.y),
        vec4(0,0,1,p.z),
        vec4(0,0,0,1)  
);
}

vec3 repeatLimit(vec3 p,float c,vec3 l) {
  
    vec3 q = p - c * clamp( floor((p/c)+0.5) ,-l,l);
    return q; 
}

vec3 repeat(vec3 p,vec3 s) {
   
    vec3 q = mod(p,s) - 0.5 * s;
    return q;
}

vec2 opU(vec2 d1,vec2 d2) {

    return (d1.x < d2.x) ? d1 : d2;
} 

float opIf(float d1,float d2) {

    return max(d1,d2);
}

float opSf(float d1,float d2) {

    return max(-d1,d2);
}

float smoU(float d1,float d2,float k) {

    float h = clamp(0.5 + 0.5 * (d2-d1)/k,0.0,1.0);
    return mix(d2,d1,h) - k * h * (1.0 - h);
}

float smoS(float d1,float d2,float k) {

    float h = clamp(0.5 - 0.5 * (d2+d1)/k,0.0,1.0);
    return mix(d2,-d1,h) + k * h * (1.0 - h);
}

float smoI(float d1,float d2,float k) {

    float h = clamp(0.5 + 0.5 * (d2-d1)/k,0.0,1.0);
    return mix(d2,d1,h) + k * h * (1.0 - h);
}

//Entire scene can be rounded by increasing epsilon const
float rounding(float d,float h) { 

    return d - h;
}

float concentric(float d,float h) {

    return abs(d) - h;
}

//3d Distance Field Geometry

float sphere(vec3 p,float r) { 
     
    return length(p) - r;
}

float sphereNegativeInterior(vec3 p,float r) {

    return abs(length(p)-r);
}

float ellipsoid(vec3 p,vec3 r) {

    float k0 = length(p/r); 
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

float cone(vec3 p,vec2 c) {

    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}

float roundedCone(vec3 p,float r1,float r2,float h) {

    vec2 q = vec2(length(vec2(p.x,p.z)),p.y);
    float b = (r1-r2)/h;
    float a = sqrt(1.0 - b*b);
    float k = dot(q,vec2(-b,a));

    if( k < 0.0) return length(q) - r1;
    if( k > a*h) return length(q - vec2(0.0,h)) - r2;

    return dot(q,vec2(a,b)) - r1;
}

float solidAngle(vec3 p,vec2 c,float ra) {
    
    vec2 q = vec2(length(vec2(p.x,p.z)),p.y);
    float l = length(q) - ra;
    float m = length(q - c * clamp(dot(q,c),0.0,ra));
    return max(l,m * sign(c.y * q.x - c.x * q.y));
}

float link(vec3 p,float le,float r1,float r2) {

    vec3 q = vec3(p.x,max(abs(p.y) -le,0.0),p.z);
    return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float plane(vec3 p,vec4 n) {

    return dot(p,n.xyz) + n.w;
}

float capsule(vec3 p,vec3 a,vec3 b,float r) {

    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
    return length(pa - ba * h) - r;
} 

float prism(vec3 p,vec2 h) {

    vec3 q = abs(p);
    return max(q.z - h.y,max(q.x * 0.866025 + p.y * 0.5,-p.y) - h.x * 0.5); 
}

float box(vec3 p,vec3 b) {

    vec3 d = abs(p) - b;
    return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0);
}

float roundBox(vec3 p,vec3 b,float r) {

    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float torus(vec3 p,vec2 t) {

    vec2 q = vec2(length(vec2(p.x,p.z)) - t.x,p.y);
    return length(q) - t.y; 
}

float cylinder(vec3 p,float h,float r) {
    
    float d = length(vec2(p.x,p.z)) - r;
    d = max(d, -p.y - h);
    d = max(d, p.y - h);
    return d; 
}

float hexPrism(vec3 p,vec2 h) {
 
    const vec3 k = vec3(-0.8660254,0.5,0.57735);
    p = abs(p); 
    p.xy -= 2.0 * min(dot(k.xy,p.xy),0.0) * k.xy;
 
    vec2 d = vec2(length(p.xy - vec2(clamp(p.x,-k.z * h.x,k.z * h.x),h.x)) * sign(p.y-h.x),p.z-h.y);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float octahedron(vec3 p,float s) {

    p = abs(p);

    float m = p.x + p.y + p.z - s;
    vec3 q;

    if(3.0 * p.x < m) {
       q = vec3(p.x,p.y,p.z);  
    } else if(3.0 * p.y < m) {
       q = vec3(p.y,p.z,p.x); 
    } else if(3.0 * p.z < m) { 
       q = vec3(p.z,p.x,p.y);
    } else { 
       return m * 0.57735027;
    }

    float k = clamp(0.5 *(q.z-q.y+s),0.0,s);
    return length(vec3(q.x,q.y-s+k,q.z - k)); 
}

float boxSphereDiff(vec3 p,vec3 bd,float sr) {
 
    float sphere = sphere(p,sr);
    float box = box(p,bd);
    return max(-sphere,box);
}

    float xCapsule(vec3 p) {
    float cap_x = capsule(p,vec3(1.0,0.0,0.0),vec3(0.0,0.0,1.0),.25);
    float cap_y = capsule(p,vec3(.0,-1.0,0.0),vec3(0.0,1.0,0.0),0.25);
    return min(cap_x,cap_y);
}

float binarySpheres(vec3 p,float d,float r) {

    float s = sphere(p-vec3(0.0,-d,0.0),r);
    float s2 = sphere(p-vec3(0.0,d,0.0),r);

    return min(s,s2); 
}

float sphereConesSmooth(vec3 p,float r,float sf,vec2 c) {
   
    float c1 = cone(p,vec2(c.x,c.y));
    float c2 = cone(p,vec2(c.x,-c.y)); 
    float s  = sphere(p,r);

    return smoU(c2,smoU(c1,s,sf),sf);
} 

float innerBoxDiff(vec3 p,vec3 ind,vec3 oud) {
     
     float inb = box(p,vec3(ind));
     float oub = box(p,vec3(oud));
    
     return max(-inb,oub);
} 

float cornerBoxDiff(vec3 p, vec3 cd,vec3 od) {
   
     float cdb = box(p-vec3(1.0),cd);
     float oud = box(p,od);
  
     return max(-cdb,oud);
} 

float sphereFractal(vec3 p,float r,float h,int octaves) {
 
    return length(p) + fractal312(p,octaves)*h - r;
}

float sphereDiff2Boxes(vec3 p,float sr,float b1r,float b2r) {

    float s = sphere(p,sr);
    float b1 = box(p-vec3(0.0,0.0,1.0),vec3(b1r));
    float b2 = box(p-vec3(0.0,0.0,-1.0),vec3(b2r)); 
    
    return min(max(-s,b1),max(-s,b2));
}  




vec2 scene(vec3 p) { 

vec2 res = vec2(1.0,0.0);

float df;
float df1;

vec2 texres = vec2(16.0);
vec4 tx = texture2D(u_texture,texres);
float txr = mod(float(1), tx.x);

float ra = PI_2 * txr;

mat4 r = rotationAxis(vec3(1.0,1.0,0.0),ra);
p = (vec4(p,1.0) * r).xyz;

//if(u_repeat == 1) { 
//p = repeatLimit(p,2.5,vec3(1. ));
//}


/*
if(u_df == 0) { df = sphere(p,1.0); }
if(u_df == 1) { df = box(p,vec3(.5)); }
if(u_df == 2) { df = capsule(p,vec3(0.0,-1.0,0.0),vec3(0.0,1.0,0.0),0.25); }


if(u_df == 3) { df = torus(p,vec2(1.0,0.5)); }
if(u_df == 4) { df =  roundedCone(p,0.5,0.25,1.0); }
if(u_df == 5) { df = link(p,0.5,.5,.25); } 
if(u_df == 6) { df = boxSphereDiff(p,vec3(PHI_SPHERE),1.0); }

if(u_df == 7) { df = cylinder(p,.5,0.5); }
if(u_df == 8) { df = prism(p,vec2(1.141,1.0)); } 
if(u_df == 9) { df = hexPrism(p,vec2(0.5,1.0)); } 



*/
 
/*
if(u_df2 == 2) { df1 = capsule(p,vec3(0.0,-1.0,0.0),vec3(0.0,1.0,0.0),0.25); }
if(u_df2 == 3) { df1 = torus(p,vec2(0.5,0.45)); }
if(u_df2 == 4) { df1 = roundedCone(p,0.5,0.25,1.0); }
if(u_df2 == 5) { df1 = link(p,0.5,.5,.25); } 
if(u_df2 == 6) { df1 = boxSphereDiff(p,vec3(.5),1.0); }
if(u_df2 == 7) { df1 = cylinder(p,.5,0.5); }
if(u_df2 == 8) { df1 = prism(p,vec2(1.0,0.5)); } 
if(u_df2 == 9) { df1 = hexPrism(p,vec2(0.5,1.0)); } 
*/

df = sphere(p,5.0); 

//res = vec2(max(-df,df1  ), 1.0);

res = vec2(df1,1.0);

return res;
}

vec2 rayScene(vec3 ro,vec3 rd) {
    
    float depth = 0.0;
    float d = -1.0;

    for(int i = 0; i < MARCH_STEPS; ++i) {

        vec3 p = ro + depth * rd;
        vec2 dist = scene(p);
   
        if(dist.x < EPSILON || TRACE_DIST < dist.x ) { break; }
        depth += dist.x;
        d = dist.y;

        }
 
        if(TRACE_DIST < depth) { d = -1.0; }
        return vec2(depth,d);

}

/*
float rayReflect(vec3 ro,vec3 rd) {

float depth = 0.0;
//float d = -1.0;

    for(int i = 0; i < 3; ++i) {

    float distance =  scene(ro + start * rd);

            if(distance < EPSILON) { 
            return depth;
            }

depth += distance;


    if(start >= end) {
    return end;
    }
 
return end;
}
} */

vec3 calcNormal(vec3 p) {

    vec2 e = vec2(1.0,-1.0) * EPSILON;

    return normalize(vec3(
    vec3(e.x,e.y,e.y) * scene(p + vec3(e.x,e.y,e.y)).x +
    vec3(e.y,e.x,e.y) * scene(p + vec3(e.y,e.x,e.y)).x +
    vec3(e.y,e.y,e.x) * scene(p + vec3(e.y,e.y,e.x)).x + 
    vec3(e.x,e.x,e.x) * scene(p + vec3(e.x,e.x,e.x)).x

    ));

}

vec3 rgb2hsv(in vec3 c) {

    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0),6.0) - 3.0) - 1.0,0.0,1.0); 
    rgb = rgb * rgb - (3.0 - 2.0) * rgb; 
    return c.z * mix(vec3(1.0),rgb,c.y);
}

vec3 phongModel(vec3 kd,vec3 ks,float alpha,vec3 p,vec3 cam_ray,vec3 light_pos,vec3 intensity) {  

     vec3 n = calcNormal(p);

     vec3 l = normalize(light_pos - p);

     vec3 v = normalize(cam_ray - p);
     vec3 r = normalize(reflect(-l,n));

     float ln = clamp(dot(l,n),0.0,1.0);
     float rv = dot(r,v);

     if(ln < 0.0) {
         return vec3(0.0);  
     }

     if(rv < 0.0) {
         return intensity * (kd * ln);
     }

     return intensity * (kd * ln + ks * pow(rv,alpha));
}

vec3 phongLight(vec3 ka,vec3 kd,vec3 ks,float alpha,vec3 p,vec3 cam_ray) {

     const vec3 ambient_light = 0.5  * vec3(1.0,1.0,1.0);
     vec3 color = ka * ambient_light;  
     
     vec3 light  = vec3( u_light  ) ;
     vec3 rot_light = vec3(u_rot_light);
   
     vec3 intensity = vec3(u_intensity);
     vec3 rot_light_intensity = vec3(u_rot_light_intensity);

     color += phongModel(kd,ks,alpha,p,cam_ray,light,intensity); 
     //color += phongModel(kd,ks,alpha,p,cam_ray,rot_light,rot_light_intensity);

     return color;
}

vec3 rayCamDir(vec2 uv,vec3 camPosition,vec3 camTarget) {

     vec3 camForward = normalize(camTarget - camPosition);
     vec3 camRight = normalize(cross(vec3(0.0,1.0,0.0),camForward));
     vec3 camUp = normalize(cross(camForward,camRight));

     float fPersp = 1.0;

     vec3 vDir = normalize(uv.x * camRight + uv.y * camUp + camForward * fPersp);  

     return vDir;
}

vec3 render(vec3 ro,vec3 rd) {

vec3 color = vec3(0.0);

vec2 d = rayScene(ro, rd);

vec3 p = ro + rd * d.x;

vec3 kd = vec3(0.0);
vec3 ka = vec3(0.0);
vec3 ks = vec3(0.0);

float shininess = u_shininess;
float n = 0.0;

    if(d.x > TRACE_DIST - EPSILON) {

        color = vec3(0.0);

    } else {
       
      if(u_diffuse_noise == 0) {
      n = 0.0;
      }

      if(u_diffuse_noise == 1) {
      n = distortFractal(p,4.0,u_octaves);
      }

      if(u_diffuse_noise == 2) {
      n = fractal312(p,u_octaves); 
      } 
      
      if(u_diffuse_noise == 3) {
      n = cell(p);
      }

      if(u_diffuse_noise == 4) {
      n = cell(p + fractal312(p,u_octaves));
      }
      
      if(u_diffuse_noise == 5) {
      n = distortFractal(p + cell(p),4.0,u_octaves);
      }

      kd = fmCol(p.y+n,vec3(u_diffuse_col),vec3(u_diffuse_b),vec3(u_diffuse_c),vec3(u_diffuse_d));
 
      //vec3 ka = vec3(u_ambient_col);
      vec3 ka = vec3(0.75); 
      vec3 ks = vec3(u_specular_col);

      color = phongLight(ka,kd,ks,shininess,p,ro);

}

      return color;
}

void main() {
 
vec3 cam_pos = cameraPosition;
vec3 cam_target = u_cam_target;

//vec3 cam_pos = vec3(0.0,1.5,2.5);
//vec3 cam_target = u_mouse_ray;

mat4 cam_rot = rotationAxis(vec3(0.0,1.0,0.0),u_time * 0.0001);
//cam_pos = (vec4(cam_pos,1.0) * cam_rot).xyz;

vec2 uvu = -1.0 + 2.0 * vUv.xy;

//vec2 uvu = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution;
//vec2 uvu =  -1.0 + 2.0 * (gl_FragCoord.xy/u_resolution.xy ) * 0.5 ;
//vec2 uvu = 0.5 * (gl_FragCoord.xy/u_resolution.xy) * 2.0 - 1.0 ;

//vec2 s = (gl_FragCoord.xy * 2.0 - u_resolution)/u_resolution ;
//vec4 ndcRay =vec4(s.xy,1.0,-1.0);
//vec3 ray = (cameraWorldMatrix * cameraProjectionMatrixInverse * ndcRay).xyz;
//ray = normalize(ray);
//uvu = normalize(uvu);

uvu.x *= u_resolution.x/u_resolution.y; 

vec3 direction = rayCamDir(uvu,cam_pos,cam_target);

//vec dir = rayCamDir(s,camera_position,cam_target);

vec3 color = render(cam_pos,direction);

//vec3 color = render(camera_position,dir);
//vec3 color = vec3(uvu.xy,0.0);
//vec3 color = vec3(0.0);
//vec4 color = texture2D(u_texture,vec2(gl_FragCoord.xy/256.0));

//gl_FragColor = color;
gl_FragColor = vec4(color,1.0);

}

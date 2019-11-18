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
uniform vec2 u_resolution;
uniform vec3 u_camera_target;
uniform float u_time;

uniform vec3 u_light;
uniform vec3 u_light2;
uniform vec3 u_light3;

uniform int u_df0;
uniform int u_df1;   
uniform int u_op;

uniform sampler2D u_texture;

uniform int u_repeat_dist;
uniform int u_repeat;

uniform int u_octaves;
uniform float u_epsilon;
uniform float u_trace_distance;

uniform vec3 u_diffuse_color;
uniform vec3 u_ambient_color;
uniform vec3 u_specular_color;
uniform float u_shininess;
uniform vec3 u_diffuse_b;
uniform vec3 u_diffuse_c;
uniform vec3 u_diffuse_d;
uniform int u_diffuse_distort;
uniform int u_diffuse_fractal;
uniform int u_diffuse_cell;

uniform int u_fractal_displace;
uniform int u_fractal_iterations;
uniform int u_cell_displace;
uniform int u_cell iterations;

uniform int u_swipe_right;
uniform int u_swipe_left;
uniform int u_swipe_up;
uniform int u_swipe_down;

const float PI  =  3.1415926;
const float PI_2 = 2.0 * PI;
const float PI6 = 6.0 * PI;
const float PI_6 = 6.0/PI;
const float PHI =  1.6180339;
const float PHI_INV = 1.0/PHI;
const float PHI_SPHERE = 1.0 - PHI/6.0;

const float EPSILON = 0.0001;

const int MARCH_STEPS = 64;
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

//float sin3(vec3 p) {
//return sin(p.x * u_hash) * sin(p.y * u_hash) * sin(p.z * u_hash);

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
 
float cell(vec3 x,float s) {
 
    x *= s;

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
             min_dist = min(min_dist,d);

            //min_dist = min( abs(min_dist),d );
            //min_dist = max(min_dist,d);

            }
        }
    }
 
    return min_dist;  

}

float cellTexture255(vec3 x) {
    
    vec4 tx = texture2D(u_texture,vec2(0.0 ));
    float m_dist = 1.0;
    for(int i = 0; i < 64; ++i) {
        m_dist = min(m_dist,distance(vec2( x.xy),vec2( mod(float(i),tx.x),mod(float(i+1),tx.x) ))) ;
    }
    //m_dist = min(m_dist,distance(vec2(x.xy),vec2(.23,.4)));
    // m_dist = min(m_dist,distance(vec2(x.xy),vec2(.03,.76)));
    // m_dist = min(m_dist,distance(vec2(x.xy),vec2(.443,.26)));
 
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

float fractal312(vec3 x,int octaves_n) {

    int octaves = octaves_n;

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

float distort(vec3 p,int octaves) {
    
    vec3 q = vec3(fractal312(p + vec3(0.0,0.0,1.0),octaves),      
                  fractal312(p + vec3(4.5,1.8,6.3),octaves),
                  fractal312(p + vec3(1.1,7.2,2.4),octaves)
    );

    vec3 r = vec3(fractal312(p + 4.0*q + vec3(2.1,9.4,5.1),octaves),
                  fractal312(p + 4.0*q + vec3(5.6,3.7,8.9),octaves),
                  fractal312(p + 4.0*q + vec3(4.3,0.0,3.1),octaves) 
    );

    return fractal312(p + 4.0* r,octaves);
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

//Rotations

mat2 rot(float a) {

    float s = sin(a);
    float c = cos(a);
    return mat2(c,-s,s,c);
}

mat4 rotY(float theta) {

    float c = cos(theta);
    float s = sin(theta);

    return mat4( 
        vec4(c,0,s,0),
        vec4(0,1,0,0),
        vec4(-s,0,c,0),
        vec4(0,0,0,1)
);
}

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


float torusAngle(vec3 p,vec2 sc, float ra,float rb) {
    
    p.x = abs(p.x);
    float k = (sc.y*p.x > sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
    return sqrt(dot(p,p) + ra*ra - 2.0*ra*k) -rb;
} 

float cylinder(vec3 p,float h,float r) {
    
    float d = length(vec2(p.x,p.z)) - r;
    d = max(d, -p.y - h);
    d = max(d, p.y - h);
    return d; 
}

float cylinderAxis(vec3 p,vec3 c) {

    return length(vec2(p.x,p.z)- vec2(c.x,c.y)) - c.z;
}

float hexPrism(vec3 p,vec2 h) {
 
    const vec3 k = vec3(-0.8660254,0.5,0.57735);
    p = abs(p); 
    p.xy -= 2.0 * min(dot(k.xy,p.xy),0.0) * k.xy;
 
    vec2 d = vec2(length(p.xy - vec2(clamp(p.x,-k.z * h.x,k.z * h.x),h.x)) * sign(p.y-h.x),p.z-h.y);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
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

float binarySpheresSmoothUnion(vec3 p,float d,float r1,float r2,float k) {

    float negative_y = sphere(p-vec3(0.0,-d,0.0),r1);
    float positive_y = sphere(p-vec3(0.0,d,0.0),r2);

    return smoU(negative_y,positive_y,k);
}

float sphereConesSmooth(vec3 p,float r,float sf,vec2 c) {
   
    float c1 = cone(p,vec2(c.x,c.y));
    float c2 = cone(p,vec2(c.x,-c.y)); 
    float s  = sphere(p,r);

    return smoU(c2,smoU(c1,s,sf),sf);
} 

float sphereFractal(vec3 p,float r,float h) {
 
    return length(p) + fractal312(p,5)*h - r;
}

float field0(vec3 p) {  

float res = 0.0;

if(u_df0 == 0) { res = sphere(p,1.0); }
if(u_df0 == 1) { res = box(p,vec3(1.0)); }
if(u_df0 == 2) { res = cone(p,vec2(0.25,0.45)); 
if(u_df0 == 3) { res = capsule(p,vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),1.0);
if(u_df0 == 4) { res = torus(p,vec2(1.0,0.5));
if(u_df0 == 5) { res = link(p,1.0,1.0,0.5);
if(u_df0 == 6) { res = cylinder(p,1.0,0.5);

return res; 
}

float field1(vec3 p) { 

float res = 0.0;

if(u_df1 == 0) { res = sphere(p,1.0); }
if(u_df1 == 1) { res = box(p,vec3(1.0)); }
if(u_df1 == 2) { res = cone(p,vec2(0.25,0.45));
if(u_df1 == 3) { res = capsule(p,vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),1.0);
if(u_df1 == 4) { res = torus(p,vec2(0.25,0.45));
if(u_df1 == 5) { res = link(p,1.0,1.0,0.5);
if(u_df1 == 6) { res = cylinder(p,1.0,0.5);

return res;
}

vec2 scene(vec3 p) {

vec2 res = vec2(1.0,0.0);

float df0 = 0.0;
float df1 = 0.0;

float n = 0.0;

//float mouse_scale = PI * 2.0;
//vec2 m = u_mouse.xy/u_resolution.xy;

//mat4 r = rotationAxis(vec3(1.0,0.0,0.0),0.0001 *u_time)   ;
//p = (vec4(p,1.0) * r).xyz;
 
//float mouse_scale = PI * 2.0;
//vec2 m = u_mouse.xy; 
//mat4 rx = rotationAxis(vec3(1.0,0.0,0.0), m.y * mouse_scale);
//mat4 ry = rotationAxis(vec3(0.0,1.0,0.0), m.x * mouse_scale);
//p = (vec4(p,1.0) * rx * ry).xyz;

if(u_repeat == 1) {
p = repeat(p,u_repeat_dist);
}

//p = repeatLimit(p,3.0, vec3(1.0));
//float boxes = box(p,vec3(1.0));
//res = opU(res,vec2(box(q - vec3(0.0,5.5,0.0),vec3(0.5)),0.0));  
//res = opU(res,vec2(  sphereFractal(p ,1.0,0.25),1.0) );
//float box = box(p ,vec3(.25)); 
//float sphere = sphereFractal(p,1.0,.25) ;
//float n = fractal312(p,4);

df0 = field0(p+n);
df1 = field1(p+n);

if(u_op == 0) { 
res = vec2(min(field0,field1)); 
}

if(u_op == 1) {
res = vec2(max(field0,field1));
}

if(u_op == 2) { 
res = vec2(max(-field0,field1));
}

if(u_op == 3) {
res = smoU(field0,field1,.5);
} 

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
     //float ln = dot(l,n);
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
vec3 light2 = vec3( u_light2 ) ;
vec3 light3 = vec3( u_light3 ) ;

     vec3 intensity = vec3(.5);
 
     color += phongModel(kd,ks,alpha,p,cam_ray,light,intensity); 
     color += phongModel(kd,ks,alpha,p,cam_ray,light2,intensity);
     color += phongModel(kd,ks,alpha,p,cam_ray,light3,intensity);

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

float shininess = u_shininess;

//fade effect
//if(u_time < 10.0) {
//n = n * u_time * 0.1 ; 
//}

    if(d.x > TRACE_DIST - EPSILON) {

        color = vec3(0.0);

    } else {

      float n = 0.0;  
      n = distort(p,6);

      kd = fmCol(p.y,vec3(u_diffuse_color),vec3(u_diffuse_b),vec3(u_diffuse_c),vec3(u_diffuse_d));
       
      vec3 ka = vec3(u_ambient_color);
      vec3 ks = vec3(u_specular_color);
    
      //kd = vec3(calcNormal(p);

      color = phongLight(ka,kd,ks,shininess,p,ro);
}

      return color;
}

void main() {
 
//vec3 camera_position = cameraPosition;
vec3 cam_target = u_camera_target;

vec3 cam_pos = vec3(0.0,0.0,-2.5);
//vec3 cam_target = u_mouse_ray;

mat4 cam_rot = rotationAxis(vec3(0.0,1.0,0.0),u_time * 0.0001);
cam_pos = (vec4(cam_pos,1.0) * cam_rot).xyz;

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

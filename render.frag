#version 300 es

// dolson,2019

//precision mediump float;

out vec4 out_FragColor;
varying vec2 uVu;

uniform vec2 res;
uniform float t;
uniform vec2 p;
uniform vec2 m;

const float E    =  2.7182818;
const float PI   =  radians(180.0); 
const float PI2  =  PI * 2.;
const float PHI  =  (1.0 + sqrt(5.0)) / 2.0;

const vec3 lp = vec3(1.);

float hash(vec2 p) { return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5357); }

float mod289(float p) { return p - floor(p * (1. / 289.)) * 289.; }
vec2 mod289(vec2 p) { return p - floor(p * (1. / 289.)) * 289.; }
vec3 mod289(vec3 p) { return p - floor(p * (1. / 289.)) * 289.; }
vec3 permute(vec3 p) { return mod289(((p * 34.) + 1.) * p); } 

vec2 uvd() {
   return gl_FragCoord.xy / res.xy;
}

vec2 grid(vec2 uv,float s) {
    return fract(uv * s);
}

vec2 diag(vec2 uv) {
   vec2 r = vec2(0.);
   r.x = 1.1547 * uv.x;
   r.y = uv.y + .5 * r.x;
   return r;
}

vec3 simplexGrid(vec2 uv) {

    vec3 q = vec3(0.);
    vec2 p = fract(diag(uv));
    
    if(p.x > p.y) {
        q.xy = 1. - vec2(p.x,p.y-p.x);
        q.z = p.y;
    } else {
        q.yz = 1. - vec2(p.x-p.y,p.y);
        q.x = p.x;
    }
    return q;

}

float radial(vec2 uv,float b) {
    vec2 p = uv;
    float a = atan(p.y,p.x);
    return cos(a * b);
}

float sedge(float v) {
    return smoothstep(0.,1. / res.x,v);
}
 
float cell(vec2 x,float iterations,int type) {
 
    x *= iterations;

    vec2 p = floor(x);
    vec2 f = fract(x);
 
    float min_dist = 1.0;
    
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {

                vec2 b = vec2(float(i),float(j));           
                vec2 r = mod289( p + b );
                
                vec2 diff = (b + r - f);

                float d = length(diff);

                    if(type == 0) { 
                        min_dist = min(min_dist,d);
                    }
 
                    if(type == 1) {
                        min_dist = min(min_dist,abs(diff.x)+abs(diff.y));
                    }

            }
        }
 
    return min_dist;  

}

float ns(vec2 p) {

    const float k1 = (3. - sqrt(3.))/6.;
    const float k2 = .5 * (sqrt(3.) -1.);
    const float k3 = -.5773;
    const float k4 = 1./41.;

    const vec4 c = vec4(k1,k2,k3,k4);
    
    vec2 i = floor(p + dot(p,c.yy));
    vec2 x0 = p - i + dot(i,c.xx);
  
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
    vec4 x12 = x0.xyxy + c.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    
    vec3 p1 = permute(permute(i.y + vec3(0.,i1.y,1.))
        + i.x + vec3(0.,i1.x,1.));

    vec3 m = max(.5 - vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m = m * m; 
    m = m * m;

    vec3 x = fract(p1 * c.www) - 1.;
    vec3 h = abs(x) - .5;
    vec3 ox = floor(x + .5);
    vec3 a0 = x - ox; 
    m *= 1.792842 - 0.853734 * (a0 * a0 + h * h);
     
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m,g);
}

float sin2(vec2 p,float h) {
    
    return sin(p.x*h) * sin(p.y*h);
}

float fib(float n) {

    return pow(( 1. + sqrt(5.)) /2.,n) -
           pow(( 1. - sqrt(5.)) /2.,n) / sqrt(5.); 

}

float envImp(float x,float k) {

    float h = k * x;
    return h * exp(1.0 - h);
}

float envSt(float x,float k,float n) {

    return exp(-k * pow(x,n));

}

float cubicImp(float x,float c,float w) {

    x = abs(x - c);
    if( x > w) { return 0.0; }
    x /= w;
    return 1.0 - x * x  * (3.0 - 2.0 * x);

}

float sincPh(float x,float k) {

    float a = PI * (k * x - 1.0);
    return sin(a)/a;

}

vec3 fmCol(float t,vec3 a,vec3 b,vec3 c,vec3 d) {
    
    return a + b * cos( (PI*2.0) * (c * t + d));
}

vec3 rgbHsv(vec3 c) {

    vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0.,4.,2.),
               6.)-3.)-1.,0.,1.);

    rgb = rgb * rgb * (3. - 2. * rgb);
    return c.z * mix(vec3(1.),rgb,c.y);

}

float easeIn4(float t) {

    return t * t;

}

float easeOut4(float t) {

    return -1.0 * t * (t - 2.0);

}

float easeInOut4(float t) {

    if((t *= 2.0) < 1.0) {
        return 0.5 * t * t;
    } else {
        return -0.5 * ((t - 1.0) * (t - 3.0) - 1.0);
    }
}

float easeIn3(float t) {

    return t * t * t;

}

float easeOut3(float t) {

    return (t = t - 1.0) * t * t + 1.0;

}

float easeInOut3(float t) {

    if((t *= 2.0) < 1.0) {
        return 0.5 * t * t * t;
    } else { 
        return 0.5 * ((t -= 2.0) * t * t + 2.0);

    }
}

mat2 rot2(float a) {

    float c = cos(a);
    float s = sin(a);
    
    return mat2(c,-s,s,c);
}

vec3 repeatLimit(vec3 p,float c,vec3 l) {
  
    vec3 q = p - c * clamp( floor((p/c)+0.5) ,-l,l);
    return q; 
}

vec2 repeat(vec2 p,float s) {
     vec2 q = mod(p,s) - .5 * s;
     return q;
}  

vec2 id(vec2 p,float s) {
    return floor(p/s);
}

vec2 opu(vec2 d1,vec2 d2) {

    return (d1.x < d2.x) ? d1 : d2;
} 

float opu(float d1,float d2) {
    
    return min(d1,d2);
}

float opi(float d1,float d2) {

    return max(d1,d2);
}

float opd(float d1,float d2) {

    return max(-d1,d2);
}

float smou(float d1,float d2,float k) {

    float h = clamp(0.5 + 0.5 * (d2-d1)/k,0.0,1.0);
    return mix(d2,d1,h) - k * h * (1.0 - h);
}

float smod(float d1,float d2,float k) {

    float h = clamp(0.5 - 0.5 * (d2+d1)/k,0.0,1.0);
    return mix(d2,-d1,h) + k * h * (1.0 - h);
}

float smoi(float d1,float d2,float k) {

    float h = clamp(0.5 + 0.5 * (d2-d1)/k,0.0,1.0);
    return mix(d2,d1,h) + k * h * (1.0 - h);

}  

float dot2(vec2 v) { return dot(v,v); }
float dot2(vec3 v) { return dot(v,v); }
float ndot(vec2 a,vec2 b) { return a.x * b.x - a.y * b.y; }

float circle(vec2 p,float r) {
    return length(p) - r;
}

float ring(vec2 p,float r,float w) {
    return abs(length(p) - r) - w;
}

float eqTriangle(vec2 p,float r) { 

     const float k = sqrt(3.);

     p.x = abs(p.x) - 1.;
     p.y = p.y + 1./k;

     if(p.x + k * p.y > 0.) {
         p = vec2(p.x - k * p.y,-k * p.x - p.y)/2.;
     }

     p.x -= clamp(p.x,-2.,0.);
     return -length(p) * sign(p.y);    

} 

float rect(vec2 p,vec2 b) {
    vec2 d = abs(p)-b;
    return length(max(d,0.)) + min(max(d.x,d.y),0.);
}

float roundRect(vec2 p,vec2 b,vec4 r) {
    r.xy = (p.x > 0.) ? r.xy : r.xz;
    r.x  = (p.y > 0.) ? r.x  : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x,q.y),0.) + length(max(q,0.)) - r.x;
}

float rhombus(vec2 p,vec2 b) {
   vec2 q = abs(p);
   float h = clamp(-2. * ndot(q,b)+ndot(b,b) / dot(b,b),-1.,1.);
   float d = length(q - .5 * b * vec2(1.- h,1. + h));
   return d * sign(q.x*b.y + q.y*b.x - b.x*b.y);  
}

float segment(vec2 p,vec2 a,vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa,ba)/dot(ba,ba),0.,1.);  
    return length(pa - ba * h);
}

float f(vec2 uv) {

    float n = 0.;
    
    for(int i = 1; i < 8; i++) {
        
        float e = pow(2.,float(i)); 
        float s = (1. / e);
        n += ns(uv * e) * s; 
        
        //n += sin2(uv,e) * s;
        //n += sin2(uv,ns(uv * e) * s) * s;      

    }
    return n * .5 + .5;
}

float fd2(vec2 uv) {
    return f(uv+f(uv));
}

vec3 fn(vec2 uv) {

    float d = 0.0001;

    float h  = f(uv); 
    float h1 = f(uv + vec2(d,0.));
    float h2 = f(uv + vec2(0.,d));

    return normalize(vec3(-(h1 - h),-(h2 - h),d));
}

vec3 lighting(vec2 uv,vec3 n,vec3 difc) {

     vec3 ambc = vec3(.04);
     vec3 ld = normalize(vec3(lp - vec3(uv,0.)));
     float dif = max(0.,dot(n,ld));
     vec3 ref = normalize(reflect(-ld,n));
     float spe = pow(max(0.,dot(n,ref)),8.); 

     return min(vec3(1.),ambc + difc * dif + spe);
}

void main() {
 
vec3 col = vec3(0.);

vec2 uv = -1. + 2. * uVu.xy;
uv *= res.x/res.y;
uv += p;

vec2 q = vec2(uv);
float s = 5.;

vec2 loc = floor(uv/s);
q = mod(q,s) - .5 * s;

col = lighting(uv,fn(uv),vec3(.05,.5,.1));

float h = f(uv);

if(h < .45) {
col = vec3(0.,0.,.05);
}

col = pow(col,vec3(.4545));      
out_FragColor = vec4(col,1.0);

}

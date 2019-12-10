let w,h;

let canvas;
let renderer;

let nhash,hash;  
let mouse, mouse_pressed;

let swipe_dir;

let shininess;

let eps;
let trace_dist;
let octaves;

let df;
let df2;

let repeat;
let repeat_dist;
let repeat_dir;

let ambient_col;
let specular_col;
let diffuse_col; 
let diffuse_a,diffuse_b,diffuse_c;
let intensity;
let background_col;

let diffuse_noise;

let cell_dist_type;
let cell_iterations;

let controls;

let cam,scene,geometry,mesh,mat;
let aspect;

let cam_target;

let light;
let rot_light;
let rot_light_intensity; 

let delta;
let clock;

let uniforms;
let render;

let hd;
let hds;
let htex;

function init() {

canvas = $('#canvas')[0];

w = window.innerWidth;
h = window.innerHeight; 

canvas.width  = w;
canvas.height = h;

renderer = new THREE.WebGLRenderer({canvas:canvas});

mouse_pressed = false;

aspect = w/h;
trace_distance = 1000.0;

cam = new THREE.PerspectiveCamera(45.0,aspect,0.0,trace_distance);

clock = new THREE.Clock(); 
delta = 0.0;

nhash = new Math.seedrandom();
hash = nhash();

octaves = Math.round(nhash()*12);
cell_iterations = Math.round(nhash()*48);
cell_dist_type = Math.round(nhash() * 3); 

hds  = 16*16*16;  

hd  = new Float32Array(hds); 

for(let i = 0; i < hds; i++) {
    let s = i * 3;
    hd[s]   = nhash();
    hd[s+1] = nhash();
    hd[s+2] = nhash();
}

htex  = new THREE.DataTexture(hd,16,16,THREE.RGBFormat,THREE.FloatType);

htex.needsUpdate  = true;

swipe_dir = 0;

//cam.position.set(nhash()*5.0,nhash()*5.0,nhash()*5.0);
cam.position.set(0.0,2.5,-2.5); 
cam_target  = new THREE.Vector3(0.0);

light = new THREE.Vector3(0.0,2.5,0.0);
rot_light = new THREE.Vector3(0.0,0.0,10.0); 

eps = 0.0001;
trace_dist = 1000.0;     

repeat = Math.round(nhash()) ? true : false;
repeat_dist = nhash() * 15.0;  
repeat_dir = new THREE.Vector3(Math.round(nhash()*25,Math.round()*25,Math.round()*25));

background_col = new THREE.Color(nhash(),nhash(),nhash());
ambient_col = new THREE.Color(background_col);

diffuse_noise = Math.round(nhash() * 5); 
specular_col  = new THREE.Color(1.0);
shininess      = 100.0;
intensity      = 1.0;
rot_light_intensity  = 1.0;

diffuse_col     = new THREE.Color( nhash(),nhash(),nhash());
diffuse_b       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_c       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_d       = new THREE.Color( nhash(),nhash(),nhash());

df  = Math.round(nhash() * 10.0);
df2 = Math.round(nhash() * 10.0);

controls = new THREE.OrbitControls(cam,canvas);
    controls.minDistance = 1.5;
    controls.maxDistance = 15.0;
    controls.target = cam_target;
    controls.enableDamping = true;
    controls.enablePan = false; 
    controls.enabled = false; 

scene = new THREE.Scene();
geometry = new THREE.PlaneBufferGeometry(2,2);

uniforms = {

    "u_time"                : { value : 1.0 },
    "u_resolution"          : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"               : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"       : { value : mouse_pressed },
    "u_swipe_dir"           : { value : swipe_dir }, 
    "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
    "u_light"               : new THREE.Uniform(new THREE.Vector3(light)),
    "u_rot_light"           : new THREE.Uniform(new THREE.Vector3(rot_light)),
    "u_intensity"           : { value: intensity},
    "u_rot_light_intensity"  : { value: rot_light_intensity },
    "u_hash"                : { value: hash },
    "u_df"                  : { value: df },
    "u_df2"                 : { value: df2 }, 
    "u_octaves"             : { value: octaves },
    "u_eps"                 : { value: eps },
    "u_trace_dist"          : { value: trace_dist },
    "u_repeat"              : { value: repeat },
    "u_repeat_dir"          : new THREE.Uniform(new THREE.Vector3(repeat_dir)),
    "u_repeat_dist"         : { value: repeat_dist },
    "u_background_col"      : new THREE.Uniform(new THREE.Color(background_col)), 
    "u_specular_col"        : new THREE.Uniform(new THREE.Color(specular_col)),
    "u_diffuse_col"         : new THREE.Uniform(new THREE.Color(diffuse_col)),
    "u_ambient_col"         : new THREE.Uniform(new THREE.Color(ambient_col)),
    "u_shininess"           : { value: shininess },
    "u_diffuse_b"           : new THREE.Uniform(new THREE.Color(diffuse_b)),
    "u_diffuse_c"           : new THREE.Uniform(new THREE.Color(diffuse_c)),
    "u_diffuse_d"           : new THREE.Uniform(new THREE.Color(diffuse_d)),
    "u_diffuse_noise"       : { value: diffuse_noise },
    "u_cell_iterations"     : { value: cell_iterations },
    "u_cell_dist_type"      : { value: cell_dist_type },
    "u_htex"                : { type : "t", value: htex }


};   

}

init();

ShaderLoader("render.vert","render.frag",
    function(vertex,fragment) {
        material = new THREE.ShaderMaterial({

        uniforms : uniforms,
        vertexShader : vertex,
        fragmentShader : fragment

        });

    mesh = new THREE.Mesh(geometry,material);

    scene.add(mesh);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w,h);

    render = function(timestamp) {
        requestAnimationFrame(render);
    
        //delta = clock.getDelta();    

        $('#canvas').mousedown(function() {
        mouse_pressed = true;
        });
        
        $('#canvas').mouseup(function() {
        moused_pressed = false;
        });


        if(swipeLeft()  === true) { swipe_dir = 1; }
        if(swipeUp()    === true) { swipe_dir = 2; }
        if(swipeRight() === true) { swipe_dir = 3; }
        if(swipeDown()  === true) { swipe_dir = 4; }

        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_swipe_dir"           ].value = swipe_dir;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_light"               ].value = light;
        uniforms["u_rot_light"           ].value = rot_light;
        uniforms["u_intensity"           ].value = intensity;
        uniforms["u_rot_light_intensity" ].value = rot_light_intensity; 
        uniforms["u_hash"                ].value = hash;
        uniforms["u_df"                  ].value = df;
        uniforms["u_df2"                 ].value = df2;
        uniforms["u_octaves"             ].value = octaves;
        uniforms["u_eps"                 ].value = eps;
        uniforms["u_trace_dist"          ].value = trace_dist;
        uniforms["u_repeat"              ].value = repeat;
        uniforms["u_repeat_dir"          ].value = repeat_dir;
        uniforms["u_repeat_dist"         ].value = repeat_dist;
        uniforms["u_background_col"      ].value = background_col;
        uniforms["u_ambient_col"         ].value = ambient_col;
        uniforms["u_diffuse_col"         ].value = diffuse_col;
        uniforms["u_specular_col"        ].value = specular_col;
        uniforms["u_shininess"           ].value = shininess;
        uniforms["u_diffuse_b"           ].value = diffuse_b;
        uniforms["u_diffuse_c"           ].value = diffuse_c;
        uniforms["u_diffuse_d"           ].value = diffuse_d;
        uniforms["u_diffuse_noise"       ].value = diffuse_noise;
        uniforms["u_cell_iterations"     ].value = cell_iterations;
        uniforms["u_cell_dist_type"      ].value = cell_dist_type;
        uniforms["u_htex"                ].value = htex;         

        controls.update();
        renderer.render(scene,cam);
        }
        render();
        }) 
/*
window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}*/

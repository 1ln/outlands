let display_fullscreen;
let orbit_control;
  
let fps;

let w,h;

let canvas;
let renderer;

let nhash,hash;  
let mouse, mouse_pressed;

let light;
let light_animate;
let light_speed;

let shininess;

let epsilon;
let trace_distance;
let octaves;

let df;
let repeat;
let repeat_distance;
let repeat_direction;

let ambient_color;
let specular_color;
let diffuse_color; 
let diffuse_a,diffuse_b,diffuse_c;
let intensity;
let scene_background_color;

let diffuse_noise;

let cell_distance_type;
let cell_iterations;

let controls;

let orbit_target;
let cam_orbit_target;

let cam,scene,geometry,mesh,material;
let aspect;
let fov;
let far;
let near;

let cam_target;
let cam_light;
let cam_speed;
let cam_animate;

let delta;
let clock;

let spherical;

let uniforms;
let render;

let light_target;

function init() {

canvas = $('#canvas')[0];

w = window.innerWidth;
h = window.innerHeight; 

canvas.width  = w;
canvas.height = h;

renderer = new THREE.WebGLRenderer({canvas:canvas});

let mouse_ray = new THREE.Vector3(0.0);

aspect = w/h;
fov = 25.0;
trace_distance = 1000.0;
far = trace_distance;
near = 1;

cam = new THREE.PerspectiveCamera(45.0,aspect,0.0,trace_distance);

clock = new THREE.Clock(); 
delta = 0.0;

nhash = new Math.seedrandom();
hash = nhash();
$('#hash').val(hash.toFixed(8)); 

octaves = Math.round(nhash()*12);
cell_iterations = Math.round(nhash()*48);
cell_distance_type = Math.round(nhash() * 3); 

spherical = new THREE.Spherical();
spherical.theta = Math.PI * 2.0 * nhash();
spherical.phi = Math.acos((2.0 * nhash()) - 1.0);
spherical.radius = 5.0;

//cam.position.set(nhash()*5.0,nhash()*5.0,nhash()*5.0);
cam.position.set(2.0,0.0,0.0); 
cam_target  = new THREE.Vector3(0.0);
light_target  = new THREE.Vector3(0.0);
cam_speed = 0.5;
cam_animate = Math.round(nhash() * 4);

cam_light = new THREE.Vector3(cam.position.x,cam.position.y,cam.position.z);

light = new THREE.Vector3(0.0,0.0,1.5);

light_animate = 0;
light_speed = 0.001; 

orbit_target   = new THREE.Quaternion();
cam_orbit_target = new THREE.Quaternion();

epsilon = 0.0001;

trace_distance = 1000.0;     

//repeat = Math.round(nhash() * 2.0);
repeat = 0.0;
repeat_distance = nhash() * 15.0;  
repeat_direction = new THREE.Vector3(Math.round(nhash()*25,Math.round()*25,Math.round()*25));

scene_background_color = new THREE.Color(nhash(),nhash(),nhash());

diffuse_noise = Math.round(nhash() * 5); 

ambient_color   = new THREE.Color(0.0);

specular_color  = new THREE.Color(1.0);
shininess      = 100.0;
intensity      = 1.0;

diffuse_color   = new THREE.Color( nhash(),nhash(),nhash());
diffuse_b       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_c       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_d       = new THREE.Color( nhash(),nhash(),nhash());

df = Math.round(nhash() * 10.0);

controls = new THREE.OrbitControls(cam,canvas);
    controls.minDistance = 1.5;
    //controls.maxDistance = 100.0;
    controls.target = cam_target;
    controls.enableDamping = true;
    controls.enablePan = false; 
    controls.enabled = false  ; 

scene = new THREE.Scene();
geometry = new THREE.PlaneBufferGeometry(2,2);

uniforms = {

    "u_time"                : { value : 1.0 },
    "u_resolution"          : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"               : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"       : { value : mouse_pressed },
    "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
    "u_light"               : new THREE.Uniform(new THREE.Vector3(light)),
    "u_cam_light"           : new THREE.Uniform(new THREE.Vector3(cam_light)),
    "u_intensity"           : { value: intensity},
    "u_hash"                : { value: hash },
    "u_df"                  : { value: df }, 
    "u_octaves"             : { value: octaves },
    "u_epsilon"             : { value: epsilon },
    "u_trace_distance"      : { value: trace_distance },
    "u_repeat"              : { value: repeat },
    "u_repeat_direction"    : new THREE.Uniform(new THREE.Vector3(repeat_direction)),
    "u_repeat_distance"     : { value: repeat_distance },
    "u_scene_background_color"    : new THREE.Uniform(new THREE.Color(scene_background_color)), 
    "u_specular_color"      : new THREE.Uniform(new THREE.Color(specular_color)),
    "u_diffuse_color"       : new THREE.Uniform(new THREE.Color(diffuse_color)),
    "u_ambient_color"       : new THREE.Uniform(new THREE.Color(ambient_color)),
    "u_shininess"           : { value: shininess },
    "u_diffuse_b"           : new THREE.Uniform(new THREE.Color(diffuse_b)),
    "u_diffuse_c"           : new THREE.Uniform(new THREE.Color(diffuse_c)),
    "u_diffuse_d"           : new THREE.Uniform(new THREE.Color(diffuse_d)),
    "u_diffuse_noise"       : { value: diffuse_noise },
    "u_cell_iterations"     : { value: cell_iterations },
    "u_cell_distance_type"  : { value: cell_distance_type },
    "u_texture"             : { type : "t", value: texture }


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
    
        delta = clock.getDelta();
    
        orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,1.0,0.0),( delta * 0.15) );
        light.applyQuaternion(orbit_target);

        if(swipeUp() == true) {
        cam_orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,1.0),delta * 0.15  );
        }

        if(swipeDown() == true) {
        cam_orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,-1.0),delta * 0.15); 
        }


        cam.position.applyQuaternion(cam_orbit_target);
        
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_light"                ].value = light;
        uniforms["u_cam_light"           ].value = cam_light;
        uniforms["u_intensity"           ].value = intensity;
        uniforms["u_hash"                ].value = hash;
        uniforms["u_df"                  ].value = df;
        uniforms["u_octaves"             ].value = octaves;
        uniforms["u_epsilon"             ].value = epsilon;
        uniforms["u_trace_distance"      ].value = trace_distance;
        uniforms["u_repeat"              ].value = repeat;
        uniforms["u_repeat_direction"    ].value = repeat_direction;
        uniforms["u_repeat_distance"     ].value = repeat_distance;
        uniforms["u_scene_background_color"    ].value = scene_background_color;
        uniforms["u_ambient_color"       ].value = ambient_color;
        uniforms["u_diffuse_color"       ].value = diffuse_color;
        uniforms["u_specular_color"      ].value = specular_color;
        uniforms["u_shininess"           ].value = shininess;
        uniforms["u_diffuse_b"           ].value = diffuse_b;
        uniforms["u_diffuse_c"           ].value = diffuse_c;
        uniforms["u_diffuse_d"           ].value = diffuse_d;
        uniforms["u_diffuse_noise"       ].value = diffuse_noise;
        uniforms["u_cell_iterations"     ].value = cell_iterations;
        uniforms["u_cell_distance_type"  ].value = cell_distance_type;
        uniforms["u_texture"             ].value = texture;         

        controls.update();
        renderer.render(scene,cam);
        }
        render();
        }) 

$('#update_hash').click(function() {
    hash = parseFloat($('#hash').val());
}); 


/* 
window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}
*/

let display_fullscreen;
let orbit_control;
  
let w,h;
let canvas;

let aspect;
let renderer;

let nhash,hash;  
let mouse, mouse_pressed;

let scene_light,cam_light; 
let cam_light_enabled,scene_light_enabled;
let shininess;

let epsilon;
let trace_distance;

let df;
let repeat;

let ambient_color;
let specular_color;
let diffuse_color; 
let diffuse_a,diffuse_b,diffuse_c;

let diffuse_noise;
let positional_noise;

let controls;

let cam,scene,geometry,mesh,material;
let cam_target;

let uniforms;
let render;

function init() {

canvas = $('#canvas')[0];
//w = window.innerWidth;
//h = window.innerHeight; 
w = 512;
h = 512;

canvas.width  = w;
canvas.height = h;

aspect = w/h;

renderer = new THREE.WebGLRenderer({canvas:canvas});

nhash = new Math.seedrandom();
hash = nhash();
$('#hash').val(hash.toFixed(8)); 

cam_target  = new THREE.Vector3(0.0);

scene_light = new THREE.Vector3(0.0,10.0,0.0);
scene_light_enabled = true;
cam_light = new THREE.Vector3(0.0,0.0,0.0);
cam_light_enabled = false; 

let mouse_ray = new THREE.Vector3(0.0); 

let orbit_target   = new THREE.Quaternion();

epsilon = 0.0001;
trace_distance = 1000.0;     

repeat = false;
     
ambient_color   = new THREE.Vector3(nhash(),nhash(),nhash()); 

specular_color  = new THREE.Vector3(nhash(),nhash(),nhash());
shininess      = nhash() * 100.0;

diffuse_color   = new THREE.Vector3( nhash(),nhash(),nhash());
diffuse_b       = new THREE.Vector3( nhash(),nhash(),nhash());
diffuse_c       = new THREE.Vector3( nhash(),nhash(),nhash());
diffuse_d       = new THREE.Vector3( nhash(),nhash(),nhash());

df = Math.round(nhash() * 10.0);
$('#df').val(df);

    cam = new THREE.PerspectiveCamera(45.0, canvas.width/canvas.height,1,2500);
    cam.position.set(0.0,0.0,-5.0);
    cam.lookAt(0.0);

$('#cam_x').val(0.0);
$('#cam_y').val(0.0);
$('#cam_z').val(-5.0);

controls = new THREE.OrbitControls(cam,canvas);
    controls.minDistance = 1.5;
    controls.maxDistance = 24.5;
    controls.target = cam_target;
    controls.enableDamping = true;
    controls.enablePan = false; 
    controls.enabled = true  ; 

scene = new THREE.Scene();
geometry = new THREE.PlaneBufferGeometry(2,2);

uniforms = {

    "u_time"                : { value : 1.0 },
    "u_resolution"          : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"               : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"       : { value : mouse_pressed },
    "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
    "u_cam_light_enabled"   : { value: cam_light_enabled },
    "u_scene_light"         : new THREE.Uniform(new THREE.Vector3(scene_light)),
    "u_scene_light_enabled" : { value: scene_light_enabled }, 
    "u_cam_light"           : new THREE.Uniform(new THREE.Vector3(cam_light)),
    "u_hash"                : { value: hash },
    "u_df"                  : { value: df }, 
    "u_octaves"             : { value: 0.0 },
    "u_epsilon"             : { value: epsilon },
    "u_trace_distance"      : { value: trace_distance },
    "u_repeat"              : { value: false },
    "u_specular_color"      : new THREE.Uniform(new THREE.Vector3(specular_color)),
    "u_diffuse_color"       : new THREE.Uniform(new THREE.Vector3(diffuse_color)),
    "u_ambient_color"       : new THREE.Uniform(new THREE.Vector3(ambient_color)),
    "u_shininess"           : { value: shininess },
    "u_diffuse_b"           : new THREE.Uniform(new THREE.Vector3(diffuse_b)),
    "u_diffuse_c"           : new THREE.Uniform(new THREE.Vector3(diffuse_c)),
    "u_diffuse_d"           : new THREE.Uniform(new THREE.Vector3(diffuse_d)),
    //"u_diffuse_distort"  : new THREE.Uniform(new THREE.Vector3(diffuse_distort)),
    //"u_diffuse_fractal"  : new THREE.Uniform(new THREE.Vector3(diffuse_fractal)),
    //"u_diffuse_cell"     : new THREE.Uniform(new THREE.Vector3(diffuse_cell)),
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
        
        //Rotation around orbital target
        //orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,1.0),( Math.PI / 2.0 *0.01) );
        //light.applyQuaternion(orbit_target);

        //camera.position.applyQuaternion(orbit_target );

        //if(swipeRight() === true) {
        //}
        //if(cam_move_linear === true) {
        //cam.translateZ(-1.0 );
        //} 
    
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_scene_light_enabled" ].value = scene_light_enabled;
        uniforms["u_cam_light_enabled"   ].value = cam_light_enabled; 
        uniforms["u_scene_light"         ].value = scene_light;
        uniforms["u_cam_light"           ].value = cam_light; 
        uniforms["u_hash"                ].value = hash;
        uniforms["u_df"                  ].value = df;
        uniforms["u_octaves"             ].value = 0.0;
        uniforms["u_epsilon"             ].value = epsilon;
        uniforms["u_trace_distance"      ].value = trace_distance;
        uniforms["u_repeat"              ].value = repeat;
        uniforms["u_ambient_color"       ].value = ambient_color;
        uniforms["u_diffuse_color"       ].value = diffuse_color;
        uniforms["u_specular_color"      ].value = specular_color;
        uniforms["u_shininess"           ].value = shininess;
        uniforms["u_diffuse_b"           ].value = diffuse_b;
        uniforms["u_diffuse_c"           ].value = diffuse_c;
        uniforms["u_diffuse_d"           ].value = diffuse_d;
     //   uniforms["u_diffuse_distort" ].value = diffuse_distort;
     //   uniforms["u_diffuse_fractal" ].value = diffuse_fractal;
        uniforms["u_texture"             ].value = texture;
       



        renderer.render(scene,cam);
        }
        render();
        }) 

$('#re_init').click(function() {
    init();      
});

$('#set_hash').click(function() {
    hash = parseFloat($('#hash').val());
}); 
   
$('#epsilon').change(function() {
    epsilon = parseFloat($('#epsilon').val());
});

$('#trace_distance').change(function() {
    trace_distance = parseFloat($('#trace_distance').val());
});   

$('#df_selection').change(function() {
    df = parseInt($('#df').val());
});

$('#repeat').change(function() {
    
    if($('#repeat')[0].checked !== false) {
        repeat = true;
    } else {
        repeat = false;
    }

});

$('#cam_light_enabled').change(function() {

    if($('#cam_light_enabled')[0].checked !== false) {
        cam_light_enabled = true;
    } else { 
        cam_light_enabled = false;
    }
});

$('#scene_light_enabled').change(function() {
    if($('#scene_light_enabled')[0].checked !== false) {
        scene_light_enabled = true;
    } else {
        scene_light_enabled = false;
    }
});

$('#set_cam_pos').click(function() {
        
         cam.position.set( 
         parseFloat($('#cam_x').val()),
         parseFloat($('#cam_y').val()),
         parseFloat($('#cam_z').val())
         ); 
}); 

$('#set_cam_light_pos').click(function() {
     cam_light.position.set(
          parseFloat($('#cam_light_x').val()),
          parseFloat($('#cam_light_y').val()),
          parseFloat($('#cam_light_z').val())
          );
}); 

$('#set_scene_light_pos').click(function() { 
             scene_light.position.set(
                 parseFloat($('#scene_light_x').val()),
                 parseFloat($('#scene_light_y').val()),
                 parseFloat($('#scene_light_z').val())
             );      
});
/* 
window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}
*/

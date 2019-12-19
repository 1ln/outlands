let w,h;

let canvas;
let renderer;

let nhash,hash;  
let mouse, mouse_pressed;

let swipe_dir;

let df;

let diffuse_col; 
let diffuse_a,diffuse_b,diffuse_c;

let diffuse_noise;

let controls;

let cam,scene,geometry,mesh,mat;
let aspect;

let cam_target;

let light;

let delta;
let clock;

let uniforms;
let render;

function init() {

canvas = $('#canvas')[0];

w = window.innerWidth;
h = window.innerHeight; 

canvas.width  = w;
canvas.height = h;

renderer = new THREE.WebGLRenderer({canvas:canvas});

mouse_pressed = 0;

aspect = w/h;
trace_distance = 1000.0;

cam = new THREE.PerspectiveCamera(45.0,aspect,0.0,trace_distance);

clock = new THREE.Clock(); 
delta = 0.0;

nhash = new Math.seedrandom();
hash = nhash();

swipe_dir = 0;

cam.position.set(0.0,0.0,-1.0); 
cam_target  = new THREE.Vector3(0.0);

diffuse_noise = Math.round(nhash() * 5); 

diffuse_col     = new THREE.Color( nhash(),nhash(),nhash());
diffuse_b       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_c       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_d       = new THREE.Color( nhash(),nhash(),nhash());

df  = Math.round(nhash() * 10.0);

controls = new THREE.OrbitControls(cam,canvas);
    controls.minDistance = 0.0;
    controls.maxDistance = 15.0;
    controls.target = cam_target;
    controls.enableDamping = true;
    controls.enablePan = false; 
    controls.enabled = true; 

scene = new THREE.Scene();
geometry = new THREE.PlaneBufferGeometry(2,2);

uniforms = {

    "u_time"                : { value : 1.0 },
    "u_resolution"          : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"               : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"       : { value : mouse_pressed },
    "u_swipe_dir"           : { value : swipe_dir }, 
    "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
    "u_hash"                : { value: hash },
    "u_df"                  : { value: df },
    "u_diffuse_col"         : new THREE.Uniform(new THREE.Color(diffuse_col)),
    "u_diffuse_b"           : new THREE.Uniform(new THREE.Color(diffuse_b)),
    "u_diffuse_c"           : new THREE.Uniform(new THREE.Color(diffuse_c)),
    "u_diffuse_d"           : new THREE.Uniform(new THREE.Color(diffuse_d)),
    "u_diffuse_noise"       : { value: diffuse_noise },


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
        
        console.log(mouse_pressed);

        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_swipe_dir"           ].value = swipe_dir;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_hash"                ].value = hash;
        uniforms["u_df"                  ].value = df;
        uniforms["u_diffuse_col"         ].value = diffuse_col;
        uniforms["u_diffuse_b"           ].value = diffuse_b;
        uniforms["u_diffuse_c"           ].value = diffuse_c;
        uniforms["u_diffuse_d"           ].value = diffuse_d;
        uniforms["u_diffuse_noise"       ].value = diffuse_noise;

        controls.update();
        renderer.render(scene,cam);
        }
        render();
        }) 
/*
     $('#canvas').mousedown(function() { 
        mouse_pressed = true;
        
      });

     $('#canvas').mouseup(function() {
       mouse_pressed = false;
       });        
 */    

/*
window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}*/

let w,h;

let canvas,context;

let renderer;
let render;
let uniforms;

let nhash,hash;  
let tex_size;
let noise;
let noise_texture;

let mouse_pressed,mouse;
let swipe_dir;

let controls;

let cam,scene,geometry,mesh,mat;

let cam_target;

let delta;
let clock;

function init() {

canvas  = $('#canvas')[0];
context = canvas.getContext('webgl2',{ antialias:false });

w = window.innerWidth;
h = window.innerHeight; 

canvas.width  = w;
canvas.height = h;

renderer = new THREE.WebGLRenderer({canvas:canvas,context:context});

cam = new THREE.PerspectiveCamera(1.0,w/h,0.0,1000.0);

clock = new THREE.Clock(); 
delta = 0.0;

nhash = new Math.seedrandom();
hash = nhash();

tex_size = 32*32*32;
noise = new Float32Array(tex_size);

for(let i = 0; i < size; i++) {

    noise[i]     = nhash();
    noise[i + 1] = nhash();
    noise[i + 2] = nhash();

}

noise_texture = new THREE.DataTexture3D(noise,32,32,32);
console.log(noise_texture);

mouse = new THREE.Vector2(0.0); 
mouse_pressed = 0;
swipe_dir = 0;

cam.position.set(0.0,0.0,5.0); 
cam_target  = new THREE.Vector3(0.0);

controls = new THREE.OrbitControls(cam,canvas);

    controls.minDistance = 0.0;
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
    "u_noise_tex"           : { value: noise_texture }

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
    
  //      delta = clock.getDelta();    

  /*
        if(swipeLeft()  === true) { swipe_dir = 1; }
        if(swipeUp()    === true) { swipe_dir = 2; }
        if(swipeRight() === true) { swipe_dir = 3; }
        if(swipeDown()  === true) { swipe_dir = 4; }
  */   

 
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_swipe_dir"           ].value = swipe_dir;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_hash"                ].value = hash;
        uniforms["u_noise_tex"           ].value = noise_texture;       

        //controls.update();
        renderer.render(scene,cam);
        }
        render();
        }) 

$('#canvas').mousedown(function() { 
    mouse_pressed = true;
    });

$('#canvas').mouseup(function() {
    mouse_pressed = false;
    });        

window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}

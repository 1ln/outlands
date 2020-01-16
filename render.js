let w,h;

let canvas,context;

let renderer;
let render;
let uniforms;

let nhash,hash;  
let tex_size;
let tex;
let n;
let noise_texture;

let light_pos;

let mouse_pressed,mouse_held,mouse;
let swipe_dir;

let raycaster;

let controls;

let cam,scene,geometry,mesh,mat;

let cam_light_pos;
let cam_target;

let delta;
let clock;

let eps,trace_dist,march_steps;

let gamma;
let shininess;
let intensity;
let bkg;

let fractional_noise;
let octaves,hurst;

let cell_noise;
let cell_iterations;

let repeat,repeat_dir

let diffuse,diffb,diffc,diffd;

let r = new THREE.Quaternion();


function init() {

    canvas  = $('#canvas')[0];
    context = canvas.getContext('webgl2',{ antialias:false });

    w = window.innerWidth;
    h = window.innerHeight; 

    canvas.width  = w;
    canvas.height = h;

    renderer = new THREE.WebGLRenderer({canvas:canvas,context:context});

    cam = new THREE.PerspectiveCamera(45.,w/h,0.0,1000.0);
    raycaster = new THREE.Raycaster();

    clock = new THREE.Clock(); 
    delta = 0.0;

    nhash = new Math.seedrandom();
    hash = nhash();
 
    updateNoiseTex();

    mouse = new THREE.Vector2(0.0); 
    mouse_pressed = 0;
    mouse_held = 0;
    swipe_dir = 0;

    cam.position.set(0.0,0.0,5.0); 
    cam_target  = new THREE.Vector3(0.0);

    controls = new THREE.OrbitControls(cam,canvas);

        controls.minDistance = 1.0;
        controls.maxDistance = 15.0;
        controls.target = cam_target;
        controls.enableDamping = true;
        controls.enablePan = false; 
        controls.enabled = true;

    scene = new THREE.Scene();
    geometry = new THREE.PlaneBufferGeometry(2,2);

    march_steps = 100;
    eps = 0.0001;
    trace_dist = 1000;

    octaves = 4;
    hurst = 0.5;
    fractional_noise = 0;
    cell_noise = 0;
    cell_iterations;

    diffuse = new THREE.Color(0.5);
    diffb   = new THREE.Color(0.0);
    diffc   = new THREE.Color(0.0);
    diffd   = new THREE.Color(0.0);

    shininess = 100.0;
    gamma = 0.4545;
    intensity = new THREE.Vector3(1.0);
    cam_intensity = THREE.Vector3(1.0);

    repeat = 0;
    repeat_dir = new THREE.Vector(5.0);

    uniforms = {

        "u_time"                : { value : 1.0 },
        "u_resolution"          : new THREE.Uniform(new THREE.Vector2(w,h)),
        "u_mouse"               : new THREE.Uniform(new THREE.Vector2()),
        "u_mouse_pressed"       : { value : mouse_pressed },
        "u_swipe_dir"           : { value : swipe_dir }, 
        "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
        "u_hash"                : { value: hash },
        "u_march_steps"         : { value: march_steps },
        "u_eps"                 : { value: eps },
        "u_trace_dist"          : { value: trace_distance },
        "u_diffuse"             : new THREE.Uniform(new THREE.Vector3(diffuse)),
        "u_diffb"               : new THREE.Uniform(new THREE.Vector3(diffb)),
        "u_diffc"               : new THREE.Uniform(new THREE.Vector3(diffc)),
        "u_diffd"               : new THREE.Uniform(new THREE.Vector3(diffd)),
        "u_light_pos"           : new THREE.Uniform(new THREE.Vector3(light_pos)),
        "u_cam_light_pos"       : new THREE.Uniform(new THREE.Vector3(cam_light_pos)),
        "u_shininess"           : { value: shininess },
        "u_gamma"               : { value: gamma },
        "u_intensity"           : new THREE.Uniform(new THREE.Vector3(intensity)),
        "u_cam_intensity"       : new THREE.Uniform(new THREE.Vector3(cam_intensity)),
        "u_repeat"              : { value: repeat },
        "u_repeat_dir"          : new THREE.Uniform(new THREE.Vector3(repeat_dir)),
        "u_octaves"             : { value: octaves },
        "u_hurst"               : { value: hurst },
        "u_fractional_noise"    : { value: fractional_noise },
        "u_cell_noise"          : { value: cell_noise }, 
        "u_cell_iterations"     : { value: cell_iterations },
        "u_noise_tex"           : { type:"t", value: noise_texture }

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
      
        raycaster.setFromCamera(mouse,cam);

        if(update_pos_new === false) { 
        orbiter_pos.applyQuaternion(r);
        } else {
       // r.setFromAxisAngle(mouse_pos,0.001);
        }

        if(mouse_held === true && mouse_pressed === true) {
        orbiter_pos.z += 0.05;
        fuel -= .025;
        }

        if(orbiter_pos.z > 10) {
            
            hash = nhash();
        }

        requestAnimationFrame(render);
    
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_swipe_dir"           ].value = swipe_dir;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_hash"                ].value = hash;
        uniforms["u_march_steps"         ].value = march_steps;
        uniforms["u_trace_dist"          ].value = trace_dist;
        uniforms["u_eps"                 ].value = eps;
        uniforms["u_orbiter_pos"         ].value = orbiter_pos;
        uniforms["u_gamma"               ].value = gamma;
        uniforms["u_light_pos"           ].value = light_pos;
        uniforms["u_cam_light_pos"       ].value = cam_light_pos;
        uniforms["u_shininess"           ].value = shininess;
        uniforms["u_intensity"           ].value = intensity;
        uniforms["u_cam_intensity"       ].value = cam_intensity;
        uniforms["u_diffuse"             ].value = diffuse;
        uniforms["u_diffb"               ].value = diffb;
        uniforms["u_diffc"               ].value = diffc;
        uniforms["u_diffd"               ].value = diffd;
        uniforms["u_octaves"             ].value = octaves;
        uniforms["u_hurst"               ].value = hurst;
        uniforms["u_fractional_noise"    ].value = fractional_noise;
        uniforms["u_cell_noise"          ].value = cell_noise;
        uniforms["u_cell_iterations"     ].value = cell_iterations;
        uniforms["u_bkg"                 ].value = bkg;
        uniforms["u_repeat"              ].value = repeat;
        uniforms["u_repeat_dir"          ].value = repeat_dir;    
        uniforms["u_noise_tex"           ].value = noise_texture;       

        controls.update();
        renderer.render(scene,cam);

    

        } 
       
    render();

    }
) 

function updateNoiseTex() {

    n = new THREE.ImprovedNoise();

    tex_size = 32*32*32;
    tex = new Uint8ClampedArray(4*tex_size);

        for(let i = 0; i < 32; i++) {
            for(let j = 0; j < 32; j++) {
                for(let k = 0; k < 32; k++) {                
         
                let s = (i+j+k*tex_size)*4;

                tex[s]     = Math.floor( 255* n.noise(i,j,k));
                tex[s+1]   = Math.floor( 255* n.noise(i,j,k));
                tex[s+2]   = Math.floor( 255* n.noise(i,j,k));   
                tex[s+3]   = 255;

         }
            }
               }

     noise_texture = new THREE.DataTexture3D(tex,32,32,32,THREE.RGBFormat);
     noise_texture.magFilter = THREE.LinearFilter;
     console.log(noise_texture);
}

$('#canvas').keydown(function(event) {
 
    if(event.which == 37) {
        event.preventDefault(); 
   
    }

    if(event.which == 38 ) {
        event.preventDefault();

    }
    
    if(event.which == 39 ) {
        event.preventDefault();

    }

    if(event.which == 40 ) {
        event.preventDefault();

    }

});

$('#canvas').mousedown(function() { 
 
    mouse_pressed = true;
   
    reset = setTimeout(function() {
    mouse_held = true; 
     
    if(fuel > 0.0) {
 //   orbiter_pos.y += speed;    
    }   

   // fuel -= .05;

    },5000);

    update_pos = setTimeout(function() {
    update_pos_new = true;
    },2000);

});

$('#canvas').mouseup(function() {
    
    mouse_pressed = false;    
    mouse_held = false;
    update_pos_new = false;

    if(reset) {
        clearTimeout(reset);
    };

});        

window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}

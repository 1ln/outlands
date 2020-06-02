let w,h;

let canvas,context;

let renderer;
let render;
let uniforms;

let reset;

let nhash,hash;  

let mouse_pressed,mouse_held,mouse;

let controls;
let cam,scene,geometry,mesh,mat;

let cam_target;

let light_pos;

let clock;

function init() {

    canvas  = $('#canvas')[0];
    context = canvas.getContext('webgl2',{ antialias:false });

    w = window.innerWidth;
    h = window.innerHeight; 

    canvas.width  = w;
    canvas.height = h;

    renderer = new THREE.WebGLRenderer({canvas:canvas,context:context});

    cam = new THREE.PerspectiveCamera(45.,w/h,0.0,1000.0);

    clock = new THREE.Clock(); 

    nhash = new Math.seedrandom();
    hash = nhash();

    mouse = new THREE.Vector2(0.0); 
    mouse_pressed = 0;
    mouse_held = 0;

    cam.position.set(5.0,10.0,25.0); 
    cam_target  = new THREE.Vector3(0.0);
    light_pos   = new THREE.Vector3(0.0);
    
    controls = new THREE.OrbitControls(cam,canvas);

        controls.minDistance = 0.0;
        controls.maxDistance = 150.0;
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
        "u_cam_target"          : new THREE.Uniform(new THREE.Vector3(cam_target)),
        "u_light_pos"           : new THREE.Uniform(new THREE.Vector3(light_pos)),
        "u_hash"                : { value: hash }

    };   

}

init();

ShaderLoader("render.vert","logradial.frag",

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
    
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_cam_target"          ].value = cam_target; 
        uniforms["u_hash"                ].value = hash;
        uniforms["u_light_pos"           ].value = light_pos;

        light_pos.y += Math.sin(clock.getElapsedTime() * 0.001); 

        controls.update();
        renderer.render(scene,cam);

        } 
       
    render();

    }
) 

$('#canvas').mousedown(function() { 
 
    mouse_pressed = true;
   
    reset = setTimeout(function() {
    mouse_held = true; 


    },5000);


});

$('#canvas').mouseup(function() {
    
    mouse_pressed = false;    
    mouse_held = false;
    
    hash = nhash();

    if(reset) {
        clearTimeout(reset);
    };

});        

window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}

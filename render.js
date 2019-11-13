let display_fullscreen = false;
let orbit_controls = false;

let canvas = $('#canvas')[0];

let w,h;
if(display_fullscreen === true) {
    w = window.innerWidth;
    h = window.innerHeight;
} else {
    w = 512;
    h = 512;
}

canvas.width  = w;
canvas.height = h;

let aspect = w/h;

let renderer = new THREE.WebGLRenderer({canvas:canvas});

let nhash = new Math.seedrandom();

let mouse_pressed = false;
let mouse = new THREE.Vector2();

let raycaster = new THREE.Raycaster();
let clock = new THREE.Clock();
let cam_target  = new THREE.Vector3(0.0);
let light = new THREE.Vector3(0.0,10.0,0.0);
let mouse_ray_near = new THREE.Vector3(0.0);
let mouse_ray_far  = new THREE.Vector3(0.0);
let orbit_target   = new THREE.Quaternion();

let spherical        = new THREE.Spherical();
    spherical.theta  = nhash() * Math.PI * 2.0;
    spherical.phi    = Math.acos( (2.0 * nhash() ) - 1.0);
    spherical.radius = 1.0;

let epsilon = 0.001;
let trace_distance = 1000.0;

let shininess = 100.0;
 
let ambient_color   = new THREE.Vector3(0.0);

let specular_color  = new THREE.Vector3(nhash(),nhash(),nhash());
//let shininess      = rh() * 100.0;

let diffuse_color   = new THREE.Vector3( nhash(),nhash(),nhash());
let diffuse_b       = new THREE.Vector3( nhash(),nhash(),nhash());
let diffuse_c       = new THREE.Vector3( nhash(),nhash(),nhash());
let diffuse_d       = new THREE.Vector3( nhash(),nhash(),nhash());
   
let diffuse_distort = Math.round(nhash()) ? true : false;
let diffuse_fractal = Math.round(nhash()) ? true : false;
let diffuse_cell    = Math.round(nhash()) ? true : false;

let displace_sin3   = Math.round(nhash()) ? 1.0 : 0.0;
let fractal         = Math.round(nhash()) ? 1.0 : 0.0;
let cell            = false;

let camera = new THREE.PerspectiveCamera(45.0, canvas.width/canvas.height,1,2500);
    camera.position.set(3.0,2.5,-1.0);
    camera.lookAt(0.0);

let controls = new THREE.OrbitControls(camera,canvas);
    controls.minDistance = 1.5;
    controls.maxDistance = 24.5;
    controls.target = cam_target;
    controls.enableDamping = true;
    controls.enablePan = false;
    //controls.maxPolarAngle = .95;
    controls.enabled = false; 

let scene = new THREE.Scene();
let geometry = new THREE.PlaneBufferGeometry(2,2);
let mesh,material;

let uniforms = {

    "u_time"             : { value : 1.0 },
    "u_resolution"       : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"            : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"    : { value : mouse_pressed },
    "u_camera_target"    : new THREE.Uniform(new THREE.Vector3(cam_target)),
    "u_light"            : new THREE.Uniform(new THREE.Vector3(light)),
    "u_mouse_ray_far"    : new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0)),
    "u_mouse_ray_near"   : new THREE.Uniform(new THREE.Vector3(0.0)),
    "u_hash"             : { value: nhash },
    "u_octaves"          : { value: 0.0 },
    "u_epsilon"          : { value: epsilon },
    "u_trace_distance"   : { value: trace_distance },
    //"u_march_steps"      : { value: march_steps },
    "u_specular_color"   : new THREE.Uniform(new THREE.Vector3(specular_color)),
    "u_diffuse_color"    : new THREE.Uniform(new THREE.Vector3(diffuse_color)),
    "u_ambient_color"    : new THREE.Uniform(new THREE.Vector3(ambient_color)),
    "u_shininess"        : { value: shininess },
    "u_diffuse_b"        : new THREE.Uniform(new THREE.Vector3(diffuse_b)),
    "u_diffuse_c"        : new THREE.Uniform(new THREE.Vector3(diffuse_c)),
    "u_diffuse_d"        : new THREE.Uniform(new THREE.Vector3(diffuse_d)),
    "u_diffuse_distort"  : new THREE.Uniform(new THREE.Vector3(diffuse_distort)),
    "u_diffuse_fractal"  : new THREE.Uniform(new THREE.Vector3(diffuse_fractal)),
    "u_diffuse_cell"     : new THREE.Uniform(new THREE.Vector3(diffuse_cell)),
    "u_texture"          : { type : "t", value: texture },
    "u_swipe_left"       : { value: 0.0 },
    "u_swipe_right"      : { value: 0.0 },
    "u_swipe_up"         : { value: 0.0 },
    "u_swipe_down"       : { value: 0.0 }


};   

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
    //gui_container.append(gui.domElement);

    let render = function(timestamp) {
        requestAnimationFrame(render);
        
        //mouse_ray_far = new THREE.Vector3(mouse.x,mouse.y,1.0).unproject(camera);
        //mouse_ray_near = new THREE.Vector3(mouse.x,mouse.y,0.0).unproject(camera);

        //$('#canvas').mousedown(function() {
        //});

        //$('#canvas').mouseup(function() {
        //});      
        //controls.target = camera_target;

        //Rotation around orbital target
        //orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,1.0),( Math.PI / 2.0 *0.01) );
        //light.applyQuaternion(orbit_target);

         
         //if(! light.equals(new THREE.Vector3(0.0))) {
         //if( light.z < 1.0) {
         //light.z = .25 * Math.sin(t)  ;
         //light.z -= .05;
         //light.z = 0;
         //lighting.intensity -= .01;
         //console.log("test");
         //} else {
         //light.z -= .05;
         
         //}
         
         //if(! light2.equals(new THREE.Vector3(0.0))) {
         //if( light.z > -1.0) {
         //light2.z += .05;
         //} else {
         //light2.z = 0; 
         //console.log("test");
         //lighting.shininess -= .1;
         //}

         //console.log(light.y);

        //camera.position.applyQuaternion(orbit_target );

        //if(swipeLeft() === true) {
        //console.log("test");
        //}

        //if(swipeRight() === true) {

        //}
        //Move camera forward
        //camera.translateZ(-distance);

        //Move camera up
        //camera.translateY(distance);


        uniforms["u_time"            ].value = performance.now();
        uniforms["u_mouse"           ].value = mouse;
        uniforms["u_mouse_pressed"   ].value = mouse_pressed;
        uniforms["u_camera_target"   ].value = cam_target;
        uniforms["u_light"           ].value = light;
        uniforms["u_mouse_ray_far"   ].value = mouse_ray_far;
        uniforms["u_mouse_ray_near"  ].value = mouse_ray_near;
        uniforms["u_hash"            ].value = nhash;
        uniforms["u_octaves"         ].value = 0.0;
        uniforms["u_epsilon"         ].value = epsilon;
        uniforms["u_trace_distance"  ].value = trace_distance;
     //   uniforms["u_march_steps"     ].value = march_steps;
        uniforms["u_ambient_color"   ].value = ambient_color;
        uniforms["u_diffuse_color"   ].value = diffuse_color;
        uniforms["u_specular_color"  ].value = specular_color;
        uniforms["u_shininess"       ].value = shininess;
        uniforms["u_diffuse_b"       ].value = diffuse_b;
        uniforms["u_diffuse_c"       ].value = diffuse_c;
        uniforms["u_diffuse_d"       ].value = diffuse_d;
        uniforms["u_diffuse_distort" ].value = diffuse_distort;
        uniforms["u_diffuse_fractal" ].value = diffuse_fractal;
        uniforms["u_diffuse_cell"    ].value = diffuse_cell;
        uniforms["u_texture"         ].value = texture;
        uniforms["u_swipe_left"      ].value = swipeLeft();
        uniforms["u_swipe_right"     ].value = swipeRight();
        uniforms["u_swipe_up"        ].value = swipeUp();
        uniforms["u_swipe_down"      ].value = swipeDown();

        //if(camera.position.distanceTo(new THREE.Vector3(0.0,0.0,0.0)) > 1.5) {
        //console.log("test"); 
        //} else { 
        //}

        //controls.update();

        renderer.render(scene,camera);

    }
      render();
})

window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}

var canvas = $('#canvas')[0];

var camera,scene,renderer;
var uniforms,geometry,material,mesh;
var controls;

var mouse_pressed = false;

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

//var gui = new dat.GUI();

var clock          = new THREE.Clock();
var t = 0.0 ;

var camera_target  = new THREE.Vector3(0.0);

var light  = new THREE.Vector3(0.0,0.0,0.0);
var light2 = new THREE.Vector3(0.0,0.0,0.0);
var light3 = new THREE.Vector3(0.0,0.0,0.0);

//Create simplex noise texture for gpu
var size = 256;
var data = new Uint8Array(3 * size);

var r = 1.0;
var g = 0.0;
var b = 0.0;

for(var i = 0; i < size; ++i) {
    var stride = i * 3;
    
    data[stride    ] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
}

var texture = new THREE.DataTexture(data,16,16,THREE.RGBFormat); 
//texture.needsUpdate = true; 

var mouse_ray_near = new THREE.Vector3(0.0);
var mouse_ray_far  = new THREE.Vector3(0.0);

var axes_helper    = new THREE.AxesHelper(10);

var orbit_target   = new THREE.Quaternion();

var sphere         = new THREE.Vector3(0.0);
var spherical      = new THREE.Spherical();

var distance = 0.1;
var new_scene = false;

var w = window.innerWidth;
var h = window.innerHeight;
canvas.width  = w;
canvas.height = h; 

var aspect = w/h;

var prng = new Math.seedrandom();

var hash = prng();
console.log(hash);

spherical.theta  = prng() * Math.PI * 2.0;
spherical.phi    = Math.acos( (2.0 * prng() ) - 1.0);
spherical.radius = 1.0;

var render_scene = {

    hash           : hash,
    octaves        : Math.floor(prng()*4.0) + 1,
    epsilon        : 0.001,
    trace_distance : 1000,
    march_steps    : 32      

};

var lighting = {
    ambient_color   : [0.0,0.0,0.0],
    specular_color  : [prng(),prng(),prng()],
    shininess       : prng() * 100.0,
    diffuse_color   : [prng(),prng(),prng()],
    diffuse_b       : [prng(),prng(),prng()],
    diffuse_c       : [prng(),prng(),prng()],
    diffuse_d       : [prng(),prng(),prng()],
    diffuse_distort : Math.round(prng()) ? true : false,
    diffuse_fractal : Math.round(prng()) ? true : false,
    diffuse_cell    : Math.round(prng()) ? true : false

};

var displace = {
    sin3            : Math.round(prng()) ? 1.0 : 0.0,
    fractal         : Math.round(prng()) ? 1.0 : 0.0,
    cell            : false,
    cell_iterations : 6.0,
    noise_rounding  : 0.25
};

init();
//animate();
//guiUpdated();

function init() {

//canvas.width = w;
//canvas.height = h;

hash = prng();

clock.start();
//t = clock.start();

renderer = new THREE.WebGLRenderer({ canvas:canvas });

camera = new THREE.PerspectiveCamera(45.0, canvas.width/canvas.height,1,2500);

camera.position.set(3.0,2.5,-1.0);
camera.lookAt(0.0);

//controls = new THREE.OrbitControls(camera,renderer.domElement);

controls = new THREE.OrbitControls(camera,canvas);
controls.minDistance = 1.5;
controls.maxDistance = 24.5;
controls.target = camera_target;
controls.enableDamping = true;
controls.enablePan = false;
controls.maxPolarAngle = .95;
//controls.enabled = false; 

light  = new THREE.Vector3(0.0,1.0,0.0);
light2 = new THREE.Vector3(0.0,(5.0 * Math.tan(.45))+.5,-5.0);
//light3 = new THREE.Vector3(100.0);

scene = new THREE.Scene();
//scene.add(axes_helper);

geometry = new THREE.PlaneBufferGeometry(2,2);

uniforms = {

    "u_time"             : { value : 1.0 },
    "u_resolution"       : new THREE.Uniform(new THREE.Vector2(w,h)),
    "u_mouse"            : new THREE.Uniform(new THREE.Vector2()),
    "u_mouse_pressed"    : { value : mouse_pressed },
    "u_camera_target"    : new THREE.Uniform(new THREE.Vector3(camera_target)),
    "u_light"            : new THREE.Uniform(new THREE.Vector3(light)),
    "u_light2"           : new THREE.Uniform(new THREE.Vector3(light2)),
    "u_light3"           : new THREE.Uniform(new THREE.Vector3(light3)),
    //"u_sphere_position"  : new THREE.Uniform(new THREE.Vector3(0.0)),
    "u_mouse_ray_far"    : new THREE.Uniform(new THREE.Vector3(0.0,0.0,0.0)),
    "u_mouse_ray_near"   : new THREE.Uniform(new THREE.Vector3(0.0)),
    "u_hash"             : { value: hash },
    "u_octaves"          : { value: render_scene.octaves },
    "u_epsilon"          : { value: render_scene.epsilon },
    "u_trace_distance"   : { value: render_scene.trace_distance },
    "u_march_steps"      : { value: render_scene.march_steps },
    //"u_df"               : { value: distance_fields.df  },
    "u_specular_color"   : new THREE.Uniform(new THREE.Vector3(lighting.specular_color)),
    "u_diffuse_color"    : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_color)),
    "u_ambient_color"    : new THREE.Uniform(new THREE.Vector3(lighting.ambient_color)),
    "u_shininess"        : { value: lighting.shininess },
    "u_diffuse_b"        : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_b)),
    "u_diffuse_c"        : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_c)),
    "u_diffuse_d"        : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_d)),
    "u_diffuse_distort"  : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_distort)),
    "u_diffuse_fractal"  : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_fractal)),
    "u_diffuse_cell"     : new THREE.Uniform(new THREE.Vector3(lighting.diffuse_cell)),
    "u_repeat"           : { value: 0 },
    "u_texture"          : { type : "t", value: texture },
    "u_sin3_displace"    : { value: displace.sin3  },
    "u_fractal_displace" : { value: displace.fractal },
    "u_cell_displace"    : { value: 0.0 },
    "u_cell_iterations"  : { value: 0.0 },
    "u_noise_rounding"   : { value: 0.25 }


};   
}

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

//container.append(renderer.domElement);
    //gui_container.append(gui.domElement);

    var render = function(timestamp) {
        requestAnimationFrame(render);
        


        mouse_ray_far = new THREE.Vector3(mouse.x,mouse.y,1.0).unproject(camera);
        mouse_ray_near = new THREE.Vector3(mouse.x,mouse.y,0.0).unproject(camera);

        //$('#canvas').mousedown(function() {
            
            //held = setTimeout(function() {

            //if(new_scene != true) {


            /*
            render_scene.hash        = prng();
            lighting.diffuse_color   = new THREE.Vector3(prng(),prng(),prng());
            lighting.diffuse_b       = new THREE.Vector3(prng(),prng(),prng());
            lighting.diffuse_c       = new THREE.Vector3(prng(),prng(),prng());
            lighting.diffuse_d       = new THREE.Vector3(prng(),prng(),prng());
            lighting.diffuse_distort = Math.round(prng()) ? true : false;
            lighting.diffuse_cell    = Math.round(prng()) ? true : false;
            lighting.diffuse_fractal = Math.round(prng()) ? true : false;
            //console.log("test");
            //new_scene = true;            
            //} 
            */
        //},12500);
        //});

        //$('#canvas').mouseup(function() {
           
            //new_scene = false;

        //});      
        //controls.target = camera_target;

        //Rotation around orbital target
        orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,1.0),( Math.PI / 2.0 *0.01) );

        light.applyQuaternion(orbit_target);


         //t += clock.getElapsedTime() ;


         
         console.log(mouse_ray_far.length());
         if((mouse_ray_near.length() - 1.0) < .75) {
         console.log("test");
         }
         
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
        
        uniforms["u_time"].value            = timestamp / 1000;
        uniforms["u_mouse"].value           = mouse;
        uniforms["u_mouse_pressed"].value   = mouse_pressed;
        uniforms["u_camera_target"].value   = camera_target;
        uniforms["u_light"].value           = light;
        uniforms["u_light"].value          = light;
        uniforms["u_light2"].value          = light2;
        uniforms["u_mouse_ray_far"].value   = mouse_ray_far;
        uniforms["u_mouse_ray_near"].value  = mouse_ray_near;
        uniforms["u_hash"].value            = render_scene.hash;
        uniforms["u_octaves"].value         = render_scene.octaves;
        uniforms["u_epsilon"].value         = render_scene.epsilon;
        uniforms["u_trace_distance"].value  = render_scene.trace_distance;
        uniforms["u_march_steps"].value     = render_scene.march_steps;
        uniforms["u_ambient_color"].value   = lighting.ambient_color;
        uniforms["u_diffuse_color"].value   = lighting.diffuse_color;
        uniforms["u_specular_color"].value  = lighting.specular_color;
        uniforms["u_shininess"].value = lighting.shininess;
        uniforms["u_diffuse_b"].value = lighting.diffuse_b;
        uniforms["u_diffuse_c"].value = lighting.diffuse_c;
        uniforms["u_diffuse_d"].value = lighting.diffuse_d;
        uniforms["u_diffuse_distort"].value = lighting.diffuse_distort;
        uniforms["u_diffuse_fractal"].value = lighting.diffuse_fractal;
        uniforms["u_diffuse_cell"].value = lighting.diffuse_cell;
        uniforms["u_repeat"].value = 0;
        uniforms["u_texture"].value = texture;
        uniforms["u_sin3_displace"].value = displace.sin3;
        uniforms["u_fractal_displace"].value = displace.fractal;
        uniforms["u_cell_displace"].value = displace.cell;
        uniforms["u_cell_iterations"].value = displace.cell_iterations;
        uniforms["u_noise_rounding"].value = displace.noise_rounding;

        //if(camera.position.distanceTo(new THREE.Vector3(0.0,0.0,0.0)) > 1.5) {
        //console.log("test"); 
        //} else { 
        //}

        controls.update();

        renderer.render(scene,camera);

    }
      render();
})

window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}

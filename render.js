let display_fullscreen;
let orbit_control;
  
let w,h;
let canvas;

let aspect;
let renderer;

let nhash,hash;  
let mouse, mouse_pressed;

let light;
let light_rotate;
let light_rotate_speed;

let shininess;

let epsilon;
let trace_distance;
let octaves;

let df;
let repeat;

let ambient_color;
let specular_color;
let diffuse_color; 
let diffuse_a,diffuse_b,diffuse_c;
let intensity;

let diffuse_distort;
let diffuse_fractal;

let controls;

let orbit_target;

let cam,scene,geometry,mesh,material;
let cam_target;
let cam_speed;
let cam_move_linear;

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

octaves = Math.round(nhash() * 6);

cam_target  = new THREE.Vector3(0.0);
cam_speed = 0.01;
cam_move_linear = Math.round(nhash()) ? true : false;

light = new THREE.Vector3(0.0,10.0,0.0);
light_rotate = false;
light_rotate_speed = 0.001;

let mouse_ray = new THREE.Vector3(0.0); 

orbit_target   = new THREE.Quaternion();

epsilon = 0.0001;
$('#epsilon').val(epsilon);

trace_distance = 1000.0;     

repeat = Math.round(nhash()) ? true : false;
repeat_distance = Math.round(nhash() * 25.0) + 2.5;   

diffuse_distort = Math.round(nhash()) ? true : false;
diffuse_fractal = Math.round(nhash()) ? true : false;

ambient_color   = new THREE.Color(nhash(),nhash(),nhash()); 

specular_color  = new THREE.Color(nhash(),nhash(),nhash());
shininess      = nhash() * 100.0;
intensity      = ( nhash() * 10.0) +  1.0;

diffuse_color   = new THREE.Color( nhash(),nhash(),nhash());
diffuse_b       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_c       = new THREE.Color( nhash(),nhash(),nhash());
diffuse_d       = new THREE.Color( nhash(),nhash(),nhash());

df = Math.round(nhash() * 10.0);
$('#df').val(df);

$('#octaves').val(octaves);
$('#intensity').val(intensity);
$('#shininess').val(shininess);

    cam = new THREE.PerspectiveCamera(45.0, canvas.width/canvas.height,1,2500);
    cam.position.set(nhash()*5.0,nhash()*5.0,nhash()*5.0);
    //cam.lookAt(0.0);

$('#cam_x').val(cam.position.x.toFixed(5));
$('#cam_y').val(cam.position.y.toFixed(5));
$('#cam_z').val(cam.position.z.toFixed(5));

$('#light_x').val(light.x);
$('#light_y').val(light.y);
$('#light_z').val(light.z);

$('#diffuse_color').val( '#' +  diffuse_color.getHexString());
$('#diffuse_color_b').val( '#' +  diffuse_b.getHexString());
$('#diffuse_color_c').val( '#' + diffuse_c.getHexString());
$('#diffuse_color_d').val( '#' + diffuse_d.getHexString());

$('#ambient_color').val('#' + ambient_color.getHexString());

$('#specular_color').val('#' + specular_color.getHexString());

controls = new THREE.OrbitControls(cam,canvas);
    //controls.minDistance = 1.5;
    //controls.maxDistance = 100.0;
    controls.target = cam_target;
    //controls.enableDamping = true;
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
    "u_light"               : new THREE.Uniform(new THREE.Vector3(light)),
    "u_intensity"           : { value: intensity},
    "u_hash"                : { value: hash },
    "u_df"                  : { value: df }, 
    "u_octaves"             : { value: octaves },
    "u_epsilon"             : { value: epsilon },
    "u_trace_distance"      : { value: trace_distance },
    "u_repeat"              : { value: repeat },
    "u_repeat_distance"     : { value: repeat_distance },
    "u_specular_color"      : new THREE.Uniform(new THREE.Color(specular_color)),
    "u_diffuse_color"       : new THREE.Uniform(new THREE.Color(diffuse_color)),
    "u_ambient_color"       : new THREE.Uniform(new THREE.Color(ambient_color)),
    "u_shininess"           : { value: shininess },
    "u_diffuse_b"           : new THREE.Uniform(new THREE.Color(diffuse_b)),
    "u_diffuse_c"           : new THREE.Uniform(new THREE.Color(diffuse_c)),
    "u_diffuse_d"           : new THREE.Uniform(new THREE.Color(diffuse_d)),
    "u_diffuse_distort"     : { value: diffuse_distort },
    "u_diffuse_fractal"     : { value: diffuse_fractal },
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
        
        if(light_rotate === true) {
        orbit_target.setFromAxisAngle(new THREE.Vector3(0.0,0.0,1.0),( Math.PI / 2.0 * light_rotate_speed ) );
        light.applyQuaternion(orbit_target);
        }

        //camera.position.applyQuaternion(orbit_target );

        //if(swipeRight() === true) {
        //}
      
        if(cam_move_linear === true) {
        cam.translateZ(cam_speed);
        } 
    
        uniforms["u_time"                ].value = performance.now();
        uniforms["u_mouse"               ].value = mouse;
        uniforms["u_mouse_pressed"       ].value = mouse_pressed;
        uniforms["u_cam_target"          ].value = cam_target;
        uniforms["u_light"                ].value = light;
        uniforms["u_intensity"           ].value = intensity;
        uniforms["u_hash"                ].value = hash;
        uniforms["u_df"                  ].value = df;
        uniforms["u_octaves"             ].value = octaves;
        uniforms["u_epsilon"             ].value = epsilon;
        uniforms["u_trace_distance"      ].value = trace_distance;
        uniforms["u_repeat"              ].value = repeat;
        uniforms["u_repeat_distance"     ].value = repeat_distance;
        uniforms["u_ambient_color"       ].value = ambient_color;
        uniforms["u_diffuse_color"       ].value = diffuse_color;
        uniforms["u_specular_color"      ].value = specular_color;
        uniforms["u_shininess"           ].value = shininess;
        uniforms["u_diffuse_b"           ].value = diffuse_b;
        uniforms["u_diffuse_c"           ].value = diffuse_c;
        uniforms["u_diffuse_d"           ].value = diffuse_d;
        uniforms["u_diffuse_distort"     ].value = diffuse_distort;
        uniforms["u_diffuse_fractal"     ].value = diffuse_fractal;
        uniforms["u_texture"             ].value = texture;         

        controls.update();
        renderer.render(scene,cam);
        }
        render();
        }) 

$('#re_init').click(function() {
    init();      
});

$('#update_hash').click(function() {
    hash = parseFloat($('#hash').val());
}); 
   
$('#update_epsilon').change(function() {
    epsilon = parseFloat($('#epsilon').val());
});

$('#trace_distance').change(function() {
    trace_distance = parseFloat($('#trace_distance').val());
});

$('#octaves').change(function() {
    octaves = parseFloat($('#octaves').val());
});  

$('#intensity').change(function() {
    intensity = parseFloat($('#intensity').val());
});

$('#shininess').change(function() {
    shininess = parseFloat($('#shininess').val());
});

$('#diffuse_color').change(function() {
    diffuse_color.set( $('#diffuse_color').val());
}); 
   
$('#ambient_color').change(function() {
    ambient_color.set( $('#ambient_color').val());
});

$('#diffuse_color_b').change(function() {
    diffuse_b.set( $('#diffuse_color_b').val());
});

$('#diffuse_color_c').change(function() {
    diffuse_c.set( $('#diffuse_color_c').val());
});  

$('#diffuse_color_d').change(function() {
    diffuse_d.set( $('#diffuse_color_d').val());
});

$('#specular_color').change(function() {
    specular_color.set( $('#specular_color').val());
});

$('#distance_fields').change(function() {
    df = parseInt($('#distance_fields').val());
});

$('#repeat').change(function() {
    
    if($('#repeat')[0].checked !== false) {
        repeat = true;
    } else {
        repeat = false;
    }

});

$('#repeat_distance').change(function() {
    repeat_distance = parseFloat($('#repeat_distance').val());
});

$('#light_rotate_around_target').change(function() { 
  
    if($('#light_rotate_around_target')[0].checked !== false) {
        light_rotate = true;
    } else {
        light_rotate = false;
    }
}); 

$('#diffuse_fractal').change(function() {

    if($('#diffuse_fractal')[0].checked !== false) {
        diffuse_fractal = true;
    } else { 
        diffuse_fractal = false;
    }
});

$('#diffuse_distort').change(function() {
    if($('#diffuse_distort')[0].checked !== false) {
        diffuse_distort = true;
    } else {
        diffuse_distort = false;
    }
});

$('#update_cam_pos').click(function() {
        
         cam.position.set( 
         parseFloat($('#cam_x').val()),
         parseFloat($('#cam_y').val()),
         parseFloat($('#cam_z').val())
         ); 


}); 

$('#update_light_pos').click(function() {
      light.set(
          parseFloat($('#light_x').val()),
          parseFloat($('#light_y').val()),
          parseFloat($('#light_z').val())
          );
}); 















/* 
window.addEventListener('mousemove',onMouseMove,false);

function onMouseMove(event) {
    mouse.x = (event.clientX / w) * 2.0 - 1.0; 
    mouse.y = -(event.clientY / h) * 2.0 + 1.0;
}
*/

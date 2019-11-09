//Create simplex noise texture for gpu
var size = 16;
var data = new Float32Array(3 * size);

var r = 1.0;
var g = 0.0;
var b = 0.0;

for(var i = 0; i < 256; ++i) {
    var stride = i * 3;
    
    data[stride    ] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
}

var texture = new THREE.DataTexture(data,16,16,THREE.RGBFormat); 
texture.needsUpdate = true; 

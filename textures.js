//Create texture for gpu

var size = 16*16*16;
var data = new Float32Array(size);

var r = Math.random();
var g = Math.random();
var b = Math.random();
var a = 1.0;

for(var i = 0; i < size; ++i) {
     var stride = i * 3;
    
      data[i    ] = Math.random() ;
      data[stride + 1] = Math.random() ;
      data[stride + 2] = Math.random();
      


}

var texture = new THREE.DataTexture(data,16,16,THREE.RGBFormat,THREE.FloatType );
console.log(texture);
texture.needsUpdate = true; 

varying vec2 vUv;

varying vec2 atc;
varying vec2 vtc;

//attribute vec3 position;

//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;

void main() {

vUv = uv;

gl_Position = vec4(position,1.0);
//gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0 );

vtc = atc;

}

window.onload = function() {

canvas.addEventListener("touchstart",startTouch,false);
canvas.addEventListener("touchmove",moveTouch,false);

var initx = null;
var inity = null;

function startTouch(e) {

    initx = e.touches[0].clientX;
    inity = e.touches[0].clientY;
};

function moveTouch(e) {

   if(initx === null) { return; } 
   if(inity === null) { return; }

   var x =  e.touches[0].clientX;
   var y =  e.touches[0].clientY;

   var dx = initx - x;
   var dy = inity - y;

   if(Math.abs(dx) > Math.abs(dy)) { 

       if(dx > 0) {
       console.log('left');
       } else {
       console.log('right');
       }
   
   } else {
   
       if(dy > 0) {
       console.log('up');
       } else {
       console.log('down');
       }
   } 
       
initx = null;
inity = null;

e.preventDefault();

};

}

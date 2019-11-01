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

   swipe_left  = false;
   swipe_right = false;
   swipe_up    = false;
   swipe_down  = false;

   if(Math.abs(dx) > Math.abs(dy)) { 

       if(dx > 0) {
       swipe_left = true;
       console.log('left');
       } else {
       swipe_right = true;
       console.log('right');
       }
   
   } else {
   
       if(dy > 0) {
       swipe_up = true;
       console.log('up');
       } else {
       swipe_down = true;
       console.log('down');
       }
   } 
       
initx = null;
inity = null;

e.preventDefault();

};
}

var swipe_left  = false;
var swipe_right = false;
var swipe_up    = false;
var swipe_down  = false;

var swipeLeft  = function() { return swipe_left;  }
var swipeRight = function() { return swipe_right; }
var swipeUp    = function() { return swipe_up;    }
var swipeDown  = function() { return swipe_down;  }  

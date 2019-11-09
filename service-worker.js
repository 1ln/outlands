// var cacheName = 'df2';

self.addEventListener('install',function(event){

var cacheName = 'df2';

event.waitUntil(
    caches.open(cacheName).then(function(cache) {
        return cache.addAll(
            [
                'index.html',
                'stylesheet.css',
                'noise.js',
                'textures.js',
                'touchEvents.js',
                'render.vert',
                'render.frag',
                'ShaderLoader.js',
                'render.js'
            ]
         );
    })
);


}); 


self.addEventListener('activate',function(event){

});

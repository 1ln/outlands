self.addEventListener('install',function(event){

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

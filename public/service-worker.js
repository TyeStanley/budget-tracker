const APP_PREFIX = 'Budget-'
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./manifest.json"
];

// Respond with cached resources
self.addEventListener('fetch', function (event) {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME)
      .then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            
            return response;
          })
          .catch(err => {

            return cache.match(event.request);
          })
      })
      .catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  )
});

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones that has this app prefix to create keeplist
      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      // add current cache name to keeplist
      cacheKeepList.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeepList.indexOf(key) === -1) {
          return caches.delete(keyList[i])
        }
      }));
    })
  )
});
// we'll version our cache (and learn how to delete caches in
// some other post)
const cacheName = 'v1::static';

self.addEventListener('install', e => {
  // once the SW is installed, go ahead and fetch the resources
  // to make this work offline
  console.log("install");
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/',
        /*
          DEAR READER,
          ADD A LIST OF YOUR ASSETS THAT
          YOU WANT TO WORK WHEN OFFLINE
          TO THIS ARRAY OF URLS
        */
      ]).then(() => self.skipWaiting());
    })
  );
});

// when the browser fetches a url, either response with
// the cached object or go ahead and fetch the actual url
self.addEventListener('fetch', event => {
    console.log("fetch");
  event.respondWith(
    // ensure we check the *right* cache to match against
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(res => {
        return res || fetch(event.request)
      });
    })
  );
});

var config = {
    messagingSenderId: "114978862752",
    apiKey: "AIzaSyAPdo-yLm5jCzCwI8A0eJsifXofZHANnpo",
    projectId: "clicker-1577130258869",
    appId: "1:114978862752:web:f8805f2a9d47a8312d7bc5",
    databaseURL: "https://clicker-1577130258869.firebaseio.com",
};

importScripts('https://www.gstatic.com/firebasejs/7.19.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.19.1/firebase-database.js');
importScripts('/scripts/directv-remote-minor-debug@0.1.0.js');
firebase.initializeApp(config);
const db = firebase.database();

const DirecTV = self.directvRemoteMinor;

console.log("activating...", self)
const clientLocationId = (new URLSearchParams(self.location.search)).get('locationId');
console.log({clientLocationId});
self.addEventListener('activate', function(event) {
  console.log("activated")
    const zapsRefName = `zaps-develop`;
    db.ref(zapsRefName)
    .orderByChild("timestamp")
    .startAt(Date.now())
    .on("child_added", childAdded => {
        const request = childAdded.val();
        console.log({request});
        const {boxId, locationId, channel, channelMinor, ip, clientAddress} = request;
        if(locationId !== clientLocationId) {
          return console.log("not current location, skipping");
        }

        // const ip = "192.168.86.34"
        const remote = new DirecTV.Remote(ip);
        
        DirecTV.validateIP(ip, (error) => {
            if (error) {
              console.log(`.......... not valid directv ip: ${ip}`);
              return;
            }
            console.log(`*#$&%~%*$& valid directv ip: ${ip}`);
          });
          remote.tune(
            channel,
            channelMinor,
            clientAddress,
            function (err, response) {
              console.log("returned");
              if (err) return console.log(err);
              return console.log("successfully tuned", response);
            }
          );

        // var myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");
        // myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjA3MDIyMC1hMzc3LTExZTktOTIwZi05YjRjOGE0ZTBiZWMiLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNTYyODA2Nzc0fQ.AxJKvVKbUT3ebtZZ_cEoHa1L4H4mtLpQ6-iDtYWszcs");
        
        // var requestOptions = {
        //   method: 'GET',
        //   headers: myHeaders,
        //   redirect: 'follow'
        // };
        
        // fetch("https://api-develop.tryclicker.com/admin/health", requestOptions)
        //   .then(response => response.text())
        //   .then(result => console.log(result))
        //   .catch(error => console.log('error', error));

    });
});

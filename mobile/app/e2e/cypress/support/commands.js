// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

Cypress.Commands.add("landingPage", (callback) => {
  const baseUrl = "http://localhost:4141";
  cy.fixture("geolocation.json").as("fakeLocation");
  cy.get("@fakeLocation").then((fakeLocation) => {
    cy.visit(baseUrl, {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
          (cb) => {
            console.log(fakeLocation);
            return cb(fakeLocation);
          }
        );
        // todo setTimeout shouldnt be needed here
        setTimeout(() => callback(), 3000);
      },
    });
  });
});

Cypress.Commands.add("initialSetup", (callback) => {
  // cy.viewport("iphone-6+");
  cy.viewport("iphone-x");
  // cy.viewport("macbook-15");
  const dbName = "_ionicstorage";
  const storeName = "_ionickv";
  indexedDB.deleteDatabase(dbName);
  let db;
  let openRequest = indexedDB.open(dbName, 1);
  openRequest.onupgradeneeded = function (e) {
    let db = e.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
      let storeOS = db.createObjectStore(storeName);
    }
  };
  openRequest.onsuccess = function (e) {
    db = e.target.result;
    addItem();
  };
  openRequest.onerror = function (e) {
    console.log("on error!");
  };
  function addItem() {
    let transaction = db.transaction([storeName], "readwrite");
    let store = transaction.objectStore(storeName);
    let request = store.add(true, "onboarded");
    let request2 = store.add("allowed", "permission.geolocation");
    request.onerror = function (e) {
      console.log("Error", e.target.error.name);
    };
    request.onsuccess = function (e) {
      console.log("Woot! Did it");
    };
    request2.onsuccess = function (e) {
      console.log("Woot! Did it");
      callback();
    };
  }
});

// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Cypress.Commands.add('mockGeolocation', (windowObj, lat, long) => {
//   cy.stub(windowObj.navigator.geolocation, 'getCurrentPosition', cb => {
//     return cb({ coords: { latitude: lat, longitude: long } });
//   });
// });

// Cypress.Commands.add('testy', callback => {
//   cy.log('2');
//   //   return callback();
// });

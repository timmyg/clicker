Cypress.config('pageLoadTimeout', 12000);
Cypress.config('defaultCommandTimeout', 12000);

// describe('creating reservations', () => {
context('Reservations', () => {
  beforeEach(done => {
    console.log('ksdjhfdsjfjksdh');
    cy.log('I run before every test in every spec file!!!!!!');

    const dbName = '_ionicstorage';
    const storeName = '_ionickv';
    indexedDB.deleteDatabase(dbName);
    var db;
    var openRequest = indexedDB.open(dbName, 1);
    openRequest.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        // var storeOS = db.createObjectStore(storeName, { keyPath: 'name' });
        var storeOS = db.createObjectStore(storeName);
      }
    };
    openRequest.onsuccess = function(e) {
      console.log('running onsuccess');
      db = e.target.result;
      addItem();
    };
    openRequest.onerror = function(e) {
      console.log('onerror!');
      console.dir(e);
    };
    function addItem() {
      var transaction = db.transaction([storeName], 'readwrite');
      var store = transaction.objectStore(storeName);
      var item = {
        // onboared: true,
        name: 'banana',
        value: '4',
        price: '$2.99',
        description: 'It is a purple banana!',
        created: new Date().getTime(),
      };
      // var request = store.add(item);
      var request = store.add(true, 'onboarded');
      var request2 = store.add('allowed', 'permission.geolocation');
      request.onerror = function(e) {
        console.log('Error', e.target.error.name);
      };
      request.onsuccess = function(e) {
        console.log('Woot! Did it');
      };
      request2.onsuccess = function(e) {
        console.log('Woot! Did it');
        done();
      };
    }
  });

  it('should create a single reservation', () => {
    // cy.clearCookies();
    // cy.clearLocalStorage();
    cy.viewport('iphone-6+');

    // localStorage.setItem('onboarded', true);

    const baseUrl = 'https://release.mobile.tryclicker.com';
    // const baseUrl = 'http://localhost:4100';

    cy.fixture('location.json').as('fakeLocation');
    cy.get('@fakeLocation').then(fakeLocation => {
      cy.visit(baseUrl, {
        onBeforeLoad(win) {
          cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(cb => {
            console.log(fakeLocation);
            return cb(fakeLocation);
          });
        },
      });
      // cy.contains('Get Started').click();
      // cy.contains('Allow Location Access').click();
      cy.get('app-location:nth-of-type(1) ion-card-content').click({ force: true });
      cy.get('app-program:nth-of-type(2) ion-card-content').click({ force: true });
      cy.get('app-tvs ion-button')
        .first()
        .click({ force: true });
      cy.get('ion-button#confirm:not([disabled])').click({ force: true });
      cy.get('app-reservation').should($reservations => {
        expect($reservations).to.have.length(1);
      });
    });
  });
});

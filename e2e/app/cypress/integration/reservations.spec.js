Cypress.config('pageLoadTimeout', 12000);
Cypress.config('defaultCommandTimeout', 12000);

describe('creating reservations', () => {
  it('should create a single reservation', () => {
    // cy.clearCookies();
    // cy.clearLocalStorage();
    cy.viewport('iphone-6+');
    // indexedDB.deleteDatabase('_ionicstorage');
    // const db = indexedDB.open('_ionicstorage', 2);
    // const store = db.createObjectStore('_ionickv');

    // let transaction = db.transaction('_ionicstorage', 'readwrite');
    // let books = transaction.objectStore('books'); // (2)

    // let book = {
    //   id: 'js',
    //   price: 10,
    //   created: new Date(),
    // };

    // let request = books.add(book); // (3)

    // request.onsuccess = function() {
    //   // (4)
    //   console.log('Book added to the store', request.result);
    // };

    // request.onerror = function() {
    //   console.log('Error', request.error);
    // };

    const dbName = '_ionicstorage';
    // cy.wrap(
    //   new Cypress.Promise((resolve, reject) => {
    //     const req = indexedDB.open(dbName, 1);
    //     req.onerror = reject;
    //     req.onsuccess = event => {
    //       resolve(event.target.result);
    //     };
    //   }),
    //   { log: false },
    // ).then(db => {
    //   cy.log('Opened DB');
    //   Cypress.storage.set('count', 44);
    //   // TODO create object store
    //   // TODO save "count" item to 100
    // });
    // indexedDB.deleteDatabase(dbName);
    // const req = indexedDB.open(dbName, 1);
    // // req.onerror = reject;
    // req.onsuccess = event => {
    //   console.log(event.target.result);
    //   // resolve(event.target.result);
    //   Cypress.storage.set('count', 44);
    // };

    localStorage.setItem('onboarded', true);

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

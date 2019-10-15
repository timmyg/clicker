Cypress.config('pageLoadTimeout', 12000);

describe('creating reservations', () => {
  it('should create a single reservation', () => {
    // cy.clearCookies();
    // cy.clearLocalStorage();
    cy.viewport('iphone-6+');
    indexedDB.deleteDatabase('_ionicstorage');
    // const baseUrl = 'https://release.mobile.tryclicker.com';
    const baseUrl = 'http://localhost:4100';
    cy.visit(baseUrl);
    cy.contains('Get Started').click();
    cy.contains('Allow Location Access').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('ion-col.step:first-of-type').click();
    cy.get('app-location:nth-of-type(1) ion-card-content').click({ force: true });
    cy.get('app-program:nth-of-type(2) ion-card-content').click({ force: true });
    cy.get('app-tvs ion-button')
      .first()
      .click({ force: true });
    // cy.wait(1000);
    cy.get('ion-button#confirm:not([disabled])').click({ force: true });
    cy.get('app-reservation').should($reservations => {
      expect($reservations).to.have.length(1);
    });
  });
});

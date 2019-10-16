// TODO remove these when the app isnt so slow
Cypress.config('pageLoadTimeout', 12000);
Cypress.config('defaultCommandTimeout', 12000);

// describe('creating reservations', () => {
context('Reservations', () => {
  beforeEach(done => {
    cy.initialSetup(() => {
      return done();
    });
  });

  beforeEach(done => {
    cy.landingPage(() => {
      return done();
    });
  });

  it('should create a single reservation', () => {
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

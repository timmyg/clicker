// TODO remove these when the app isnt so slow
Cypress.config("pageLoadTimeout", 12000);
Cypress.config("defaultCommandTimeout", 12000);

// const environment = require('../../../src/environments/environment');

// describe('creating reservations', () => {
context("Reservations", () => {
  // cy.log('environment!', environment)
  beforeEach("create test location", () => {
    // const body = require('./')
    const location = require('../fixtures/requests/location.json');
    cy.request("POST", "https://api-develop.tryclicker.com/locations", location);
  });

  beforeEach("login + set geolocation", done => {
    cy.initialSetup(() => {
      return done();
    });
  });

  beforeEach("go to root page", done => {
    cy.landingPage(() => {
      return done();
    });
  });

  it("should create a single reservation", () => {
    cy.get("app-location:nth-of-type(1) ion-card-content").click({
      force: true
    });
    cy.get("app-program:nth-of-type(2) ion-card-content").click({
      force: true
    });
    cy.get("app-tvs ion-button")
      .first()
      .click({ force: true });
    cy.get("ion-button#confirm:not([disabled])").click({ force: true });
    cy.get("app-reservation").should($reservations => {
      expect($reservations).to.have.length(1);
    });
  });
});

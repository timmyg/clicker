// TODO remove these when the app isnt so slow
const timeout = 8000;
Cypress.config("pageLoadTimeout", timeout);
Cypress.config("defaultCommandTimeout", timeout);

// const environment = require('../../../src/environments/environment');

// describe('creating reservations', () => {
context("Reservations", () => {
  before("create test location", (done) => {
    const location = require("../fixtures/requests/location.json");
    cy.request(
      "POST",
      "https://api-develop.tryclicker.com/locations",
      location
    ).then((x) => done());
  });

  after("delete test location", () => {
    const { id } = require("../fixtures/requests/location.json");
    cy.request("DELETE", `https://api-develop.tryclicker.com/locations/${id}`);
  });

  beforeEach("login + set geolocation", (done) => {
    cy.initialSetup(() => {
      return done();
    });
  });

  beforeEach("go to root page", (done) => {
    cy.landingPage(() => {
      return done();
    });
  });

  it("should create a reservation", () => {
    cy.get("app-coins .count").then(($count) => {
      cy.log("count", $count);
      expect($count).to.have.text("1");
    });
    cy.get("app-location:nth-of-type(1) ion-card-content h1")
      .contains("Test Wicked Wolf")
      .click();
    cy.get(
      "ion-list[data-atm='programs']:not(.content-loading) app-program:nth-of-type(2) ion-card-content .title"
    ).click({ force: true });
    cy.get("app-tvs ion-button")
      .contains("2")
      .click();
    cy.get("ion-button#confirm:not([disabled])").click();
    cy.get("app-reservation").should(($reservations) => {
      expect($reservations).to.have.length(1);
    });
    cy.get("app-coins")
      .find(".count")
      .contains("0");
  });
});

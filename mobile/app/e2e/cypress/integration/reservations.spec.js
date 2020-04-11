// TODO remove these when the app isnt so slow
const timeout = 12000;
Cypress.config("pageLoadTimeout", timeout);
Cypress.config("defaultCommandTimeout", timeout);

const apiBaseUrl =
  Cypress.env("apiBaseUrl") || "https://api-develop.tryclicker.com";

context("Reservations", () => {
  before("create test location", () => {
    cy.log("apiBaseUrl", apiBaseUrl);
    const location = require("../fixtures/requests/location.json");
    cy.request("POST", `${apiBaseUrl}/locations`, location);
  });

  after("delete test location", () => {
    const { id } = require("../fixtures/requests/location.json");
    cy.request("DELETE", `${apiBaseUrl}/locations/${id}`);
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

  it("should create a reservation", () => {
    cy.get("app-coins")
      .find(".count")
      .contains("1");
    cy.get("app-location:nth-of-type(1) ion-card-content h1")
      .contains("Test Wicked Wolf")
      .click({ force: true });
    cy.get(
      "ion-list[data-atm='programs']:not(.content-loading) app-program:nth-of-type(2) ion-card-content .title"
    ).click({ force: true });
    cy.get("app-tvs ion-button")
      .contains("2")
      .click({ force: true });
    cy.get("ion-button#confirm:not([disabled])").click({ force: true });
    cy.get("app-reservation").should($reservations => {
      expect($reservations).to.have.length(1);
    });
    cy.get("app-coins")
      .find(".count")
      .contains("0");
  });
});
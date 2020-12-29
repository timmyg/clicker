// TODO remove these when the app isnt so slow
const timeout = 10000;
Cypress.config("pageLoadTimeout", timeout);
Cypress.config("defaultCommandTimeout", timeout);

const apiBaseUrl =
  Cypress.env("apiBaseUrl") || "https://api-develop.tryclicker.com";

context("Reservations", () => {
  let location;
  let boxes;
  before("create test location", () => {
    cy.log("1");
    const locationData = require("../fixtures/requests/location.json");
    cy.request("POST", `${apiBaseUrl}/locations`, locationData).then((l) => {
      location = l.body;
      const boxesData = require("../fixtures/requests/boxes.json");
      cy.request("POST", `${apiBaseUrl}/boxes/${location.id}`, boxesData).then(
        (bxs) => {
          cy.log("2");
          boxes = bxs.body;
          cy.log("3");
          // done();
        }
      );
    });
  });

  after("delete test location", () => {
    cy.request("DELETE", `${apiBaseUrl}/locations/${location.id}`);
  });

  after("delete test boxes", () => {
    boxes.forEach((b) => {
      cy.request("DELETE", `${apiBaseUrl}/boxes/${b.locationId}/${b.id}`);
    });
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
    cy.wait(5000);
    cy.get("app-coins")
      .find(".count")
      .contains("1");
    cy.wait(1000);
    cy.screenshot();
    cy.get(
      // "ion-list[data-atm='locations']:not(.content-loading) app-location:nth-of-type(1) ion-card-content h1"
      // "ion-list[data-atm='locations']:not(.content-loading) app-location:nth-of-type(1) ion-card-content [data-atm='location-name']"
      "[data-atm='location-name']"
    )
      .contains("Test Wicked Wolf")
      .click({ force: true });
    cy.screenshot();
    cy.wait(5000);
    cy.get(
      "ion-list[data-atm='programs']:not(.content-loading) app-program:nth-of-type(2) ion-card-content .title"
    ).click({ force: true });
    cy.screenshot();
    cy.wait(5000);
    cy.get("app-tvs ion-button")
      .contains("2")
      .click({ force: true });
    cy.wait(5000);
    cy.get("ion-radio-group ion-radio")
      .first()
      .click({ force: true });
    cy.get("ion-button#confirm:not([disabled])").click({ force: true });
    cy.screenshot();
    cy.wait(5000);
    cy.get("app-reservation").should(($reservations) => {
      expect($reservations).to.have.length(1);
    });
    cy.screenshot();
    cy.get("app-coins")
      .find(".count")
      .contains("0");
  });
});

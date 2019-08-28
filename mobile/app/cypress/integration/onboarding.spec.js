describe('My First Test', function() {
  beforeEach(() => {
    indexedDB.deleteDatabase('_ionicstorage');
    cy.visit('https://develop.mobile.tryclicker.com/');
  });
  describe('Show Onboarding', function() {
    it('Click Skip', function() {
      cy.get('ion-slide')
        .contains('skip')
        .click();
    });
    it('Click Get Started', function() {
      cy.get('ion-button')
        .contains('Get Started')
        .click();
    });
  });
});

describe("uu-test utland", () => {
  beforeEach(() => {
    cy.visit("aap/utland");
    cy.injectAxe();
  });
  it.skip("Har ingen feil", () => {
    cy.checkA11y();
    cy.findByRole('button', {name: /^Fortsett til søknaden$/}).click();
    cy.checkA11y();

    cy.findByRole('combobox', {name: /^Landet du skal oppholde deg i$/}).select('CC');
    cy.findByRole('button', { name: /^Neste$/}).click();

    cy.checkA11y();

    cy.findByRole('textbox', {name: /Fra dato/}).click();
    cy.checkA11y();
    cy.findByLabelText(/Mon Nov 01 2021/).click();

    cy.findByRole('textbox', {name: /Til dato/}).click();
    cy.findByLabelText(/Tue Nov 30 2021/).click();

    cy.checkA11y();
  });
});

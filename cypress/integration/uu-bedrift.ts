describe("uu-test bedrift", () => {
  beforeEach(() => {
    cy.visit("aap/bedrift");
    cy.injectAxe();
  });
  const trykkPaaNeste = () => cy.findByRole('button', {name: /Neste/}).click();
  it("Har ingen feil", () => {
    cy.checkA11y();
    cy.findByRole('button', {name: /^Fortsett til søknaden$/}).click();
    cy.checkA11y();

    trykkPaaNeste();
    cy.checkA11y();
    cy.findByLabelText(/Utviklingsfase \(inntil seks måneder\)/).click();
    cy.checkA11y();
    trykkPaaNeste();
  });
});

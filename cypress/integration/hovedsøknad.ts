describe("Søknad om AAP", () => {
  it("skal kunne sende inn en enkel søknad", () => {
    cy.visit('/aap');
    cy.contains(/Søk om AAP/);
    cy.findByRole('button', {name: /Søk AAP/}).click();
    cy.contains(/Takk, søknaden er mottatt. Nå tar vi oss av resten./);
  });
});

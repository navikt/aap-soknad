describe("Søknad om AAP under etablering av egen bedrift", () => {
  const trykkPaaNeste = () => cy.findByRole('button', {name: /Neste/}).click();
  it('grønt løp', () => {
    cy.visit('aap/bedrift');
    cy.contains('Her kan du søke om arbeidsavklaringspenger under etablering av egen virksomhet');
    cy.findByRole('button', {name: /Fortsett til søknaden/}).click();
    cy.findByLabelText(/Utviklingsfase \(inntil seks måneder\)/).click();
    trykkPaaNeste();

    cy.findByLabelText(/Bostedskommune/).type('Bærum');
    cy.findByLabelText(/Telefon privat/).type('12345678');
    trykkPaaNeste();

    cy.findByRole('button', {name: /Legg til utdanning/}).click();
    cy.findByText("Navn på skole/utdanningsinstitusjon må fylles ut").should("not.exist");
    cy.findByLabelText('Navn på skole/utdanningsinstitusjon').type("Hvam Vidregående skole");
    cy.findByLabelText('Fra (år)').type('1996');
    cy.findByLabelText('Til (år)').type('1999');
    trykkPaaNeste();

    cy.findByRole('button', {name: /Legg til yrkeserfaring \/ praksis/}).click();
    cy.findByText("Navn på arbeidsgiver / praksissted må fylles ut").should("not.exist");
    cy.findByLabelText('Navn på arbeidsgiver / praksissted').type('Video Nova, Oscarsgate');
  })
});

describe('AAP Soeknad', () => {
  it('kommer igjennom grønt løp', () => {
    cy.visit('aap/utland');
    cy.contains('Søknad om å beholde arbeidsavklaringspenger under opphold i utlandet');
    cy.findByRole('button', {name: /^Fortsett til søknaden$/}).click();
    cy.contains('Du må som hovedregel oppholde deg i Norge');
    cy.findByRole('combobox', {name: /^Landet du skal oppholde deg i$/}).select('CC');
    cy.findByRole('button', { name: /^Neste$/}).click();

    cy.findByRole('textbox', {name: /Fra dato/}).click();
    cy.findByLabelText(/Mon Nov 01 2021/).click();

    cy.findByRole('textbox', {name: /Til dato/}).click();
    cy.findByLabelText(/Tue Nov 30 2021/).click();
    cy.findByRole('button', {name: /^Neste$/}).click();
    cy.findByRole('checkbox', {name: /^Jeg bekrefter at utenlandsoppholdet/}).click();
    cy.findByRole('button', {name: /^Send søknaden$/}).click();
    cy.contains('Takk, søknaden er mottatt. Nå tar vi oss av resten.');
  })

  it('gir valideringsfeil underveis', () => {
    cy.visit('aap/utland')
    cy.contains('Søknad om å beholde arbeidsavklaringspenger under opphold i utlandet');
    cy.findByRole('button', {name: /^Fortsett til søknaden$/}).click();
    cy.contains('Du må som hovedregel oppholde deg i Norge');
    // gå videre uten å velge et land
    cy.findByRole('button', { name: /^Neste$/}).click();
    // sjekk at feilmelding finnes
    cy.findByText('Venligst velg et land.', {ignore: 'a'});
    cy.findByRole('link', {name: /Venligst velg et land./});

    // fiks feilmelding og gå videre
    cy.findByRole('combobox', {name: /^Landet du skal oppholde deg i$/}).select('CC');
    cy.findByRole('button', { name: /^Neste$/}).click();
  })
})

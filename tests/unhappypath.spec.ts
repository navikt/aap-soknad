import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');
  await page.getByRole('button', { name: 'Start søknad' }).click();
  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();
  // TODO Her forventer vi en feilmelding
  await page.getByRole('button', { name: 'Start søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/');

  // Steg 1
  await page.goto('http://localhost:3000/aap/soknad/1/');
  await expect(page.getByRole('heading', { name: 'Startdato' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page.getByTestId('error-summary')).toBeVisible();
  await page.getByRole('link', { name: 'Du må svare på om du mottar sykepenger' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#sykepenger');
  await page.getByLabel('Ja').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator(
      'p:has-text("Du må svare på om du planlegger å ta ferie før du er ferdig med sykepenger.")'
    )
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om du planlegger å ta ferie før du er ferdig med sykepenger.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.skalHaFerie');
  await page
    .getByRole('group', { name: 'Har du planer om å ta ferie før du er ferdig med sykepenger?' })
    .getByLabel('Ja')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page.locator('p:has-text("Du må svare på om du vet når du skal ta ut ferie.")').click();
  await page
    .getByRole('link', { name: 'Du må svare på om du vet når du skal ta ut ferie.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.ferieType');
  await page.getByLabel('Ja, jeg vet fra-dato og til-dato').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator('p:has-text("Du må fylle ut feriens fra-dato. Fyll inn slik: dd.mm.åååå.")')
    .click();
  await page
    .locator('p:has-text("Du må fylle ut feriens til-dato. Fyll inn slik: dd.mm.åååå.")')
    .click();
  await page
    .getByRole('link', { name: 'Du må fylle ut feriens fra-dato. Fyll inn slik: dd.mm.åååå.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.fraDato');
  await page
    .getByRole('link', { name: 'Du må fylle ut feriens til-dato. Fyll inn slik: dd.mm.åååå.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.tilDato');
  await page
    .getByText('Søknad om arbeidsavklarings­penger (AAP)Steg 1 av 10Du må fikse disse feilene fø')
    .click();
  await page.getByRole('button', { name: 'Åpne datovelger' }).first().click();
  await page.getByRole('button', { name: 'torsdag 12' }).click();
  await page.getByRole('button', { name: 'Åpne datovelger' }).nth(1).click();
  await page.getByRole('button', { name: 'tirsdag 10' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator('p:has-text("Fra-dato må være eldre enn til-dato. Fyll inn slik: dd.mm.åååå.")')
    .click();
  await page
    .getByRole('link', { name: 'Fra-dato må være eldre enn til-dato. Fyll inn slik: dd.mm.åååå.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.tilDato');
  await page.getByRole('button', { name: 'fredag 13' }).click();
  await page.getByLabel('Nei, men jeg vet antall arbeidsdager jeg skal ta ferie').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator('p:has-text("Du må skrive inn antall arbeidsdager du skal ta ferie.")')
    .click();
  await page
    .getByRole('link', { name: 'Du må skrive inn antall arbeidsdager du skal ta ferie.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.antallDager');
  await page.getByLabel('Skriv inn antall arbeidsdager du skal ta ferie').fill('3');
  await page.getByLabel('Ja, jeg vet fra-dato og til-dato').check();
  await page.getByRole('group', { name: 'Har du sykepenger nå?' }).getByLabel('Nei').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 2
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await page.getByRole('heading', { name: 'Bosted og jobb' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator(
      'p:has-text("Du må svare på om du har bodd sammenhengende i Norge de fem siste årene.")'
    )
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om du har bodd sammenhengende i Norge de fem siste årene.',
    })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/2/#medlemskap.harBoddINorgeSiste5%C3%85r'
  );
  await page.getByLabel('Ja').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator('p:has-text("Du må svare på om du har jobbet utenfor Norge de fem siste årene.")')
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om du har jobbet utenfor Norge de fem siste årene.',
    })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/2/#medlemskap.arbeidetUtenforNorgeF%C3%B8rSykdom'
  );
  await page
    .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
    .getByLabel('Ja')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .getByText('Du har svart at du har jobbet utenfor Norge de fem siste årene. Du må derfor leg')
    .nth(1)
    .click();
  await page
    .getByRole('link', {
      // eslint-disable-next-line max-len
      name: 'Du har svart at du har jobbet utenfor Norge de fem siste årene. Du må derfor legge til minst én periode med jobb utenfor Norge.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/#medlemskap.utenlandsOpphold');
  await page
    .getByRole('button', { name: 'Legg til Registrer periode med jobb utenfor Norge' })
    .click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page.getByText('Vennligst oppgi land').click();
  await page.getByText('Vennligst oppgi fra dato').click();
  await page.getByText('Vennligst oppgi til dato').click();
  await page
    .getByRole('combobox', { name: 'Hvilket land jobbet du i?' })
    .selectOption('AL:Albania');
  await page.getByRole('button', { name: 'Åpne månedsvelger' }).first().click();
  await page.getByRole('button', { name: 'februar' }).click();
  await page.getByRole('button', { name: 'Åpne månedsvelger' }).nth(1).click();
  await page.getByRole('button', { name: 'januar' }).click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page.getByText('Fra-dato må være eldre enn til-dato. Fyll inn slik: mm.åååå.').click();
  await page.getByRole('button', { name: 'Åpne månedsvelger' }).nth(1).click();
  await page.getByRole('button', { name: 'mars' }).click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page
    .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator(
      'p:has-text("Du må svare på om du har jobbet sammenhengende i Norge de fem siste årene.")'
    )
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om du har jobbet sammenhengende i Norge de fem siste årene.',
    })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/2/#medlemskap.harArbeidetINorgeSiste5%C3%85r'
  );
  await page
    .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Ja')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator(
      'p:has-text("Du må svare på om du i tillegg til jobb i Norge, også har jobbet i et annet land")'
    )
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om du i tillegg til jobb i Norge, også har jobbet i et annet land de fem siste årene.',
    })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/2/#medlemskap.iTilleggArbeidUtenforNorge'
  );
  await page
    .getByRole('group', {
      name: 'Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?',
    })
    .getByLabel('Ja')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .getByText('Du har svart at du også har jobbet utenfor Norge de fem siste årene. Du må derfo')
    .nth(1)
    .click();
  await page
    .getByRole('link', {
      // eslint-disable-next-line max-len
      name: 'Du har svart at du også har jobbet utenfor Norge de fem siste årene. Du må derfor legge til minst én periode med jobb utenfor Norge.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/#medlemskap.utenlandsOpphold');
  await page
    .getByRole('button', { name: 'Legg til Registrer periode med jobb utenfor Norge' })
    .click();
  await page.getByRole('button', { name: 'Lukk modalvindu' }).click();
  await page
    .getByRole('group', {
      name: 'Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?',
    })
    .getByLabel('Nei')
    .check();
  await page
    .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page.getByRole('button', { name: 'Legg til Registrer utenlandsopphold' }).click();
  await page.getByRole('button', { name: 'Lukk modalvindu' }).click();
  await page
    .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Ja')
    .check();
  await page
    .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 3
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');
  await page.getByRole('heading', { name: 'Yrkesskade' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator('p:has-text("Du må svare på om du har en yrkesskade eller yrkessykdom.")')
    .click();
  await page
    .getByRole('link', { name: 'Du må svare på om du har en yrkesskade eller yrkessykdom.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/#yrkesskade');
  await page.getByLabel('Ja').check();
  await expect(
    page.getByText(
      'InformasjonNAV vil sjekke om yrkesskaden/yrkessykdommen din er:godkjent av NAVhe'
    )
  ).toBeVisible();
  await page.getByLabel('Nei').check();
  await expect(
    page.getByText(
      'InformasjonNAV vil sjekke om yrkesskaden/yrkessykdommen din er:godkjent av NAVhe'
    )
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 4
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/4/');
  await page.getByRole('heading', { name: 'Kontaktperson for helseopplysninger' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page
    .locator(
      'p:has-text("Du må svare på om informasjonen om din registrerte behandler er riktig.")'
    )
    .click();
  await page
    .getByRole('link', {
      name: 'Du må svare på om informasjonen om din registrerte behandler er riktig.',
    })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/4/#registrerteBehandlere.0.erRegistrertFastlegeRiktig'
  );
  await page.getByLabel('Nei').check();
  await expect(
    page.getByText(
      'Takk for beskjed om at informasjonen er feil. Fyll ut hvilken lege vi kan kontak'
    )
  ).toBeVisible();
  await page.getByLabel('Ja').check();
  await expect(
    page.getByText(
      'Takk for beskjed om at informasjonen er feil. Fyll ut hvilken lege vi kan kontak'
    )
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Legg til Legg til lege/behandler' }).click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page.getByLabel('Fornavn').fill('Iren');
  await page.getByLabel('Etternavn').fill('Panikk');
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page.getByText('Navn:Iren Panikk').click();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 5
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/');
  await page.getByRole('heading', { name: 'Barnetillegg' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    page.getByText('Du må svare på om barnet har en årlig inntekt over 111 477kr')
  ).toHaveCount(4);
  await page
    .getByRole('link', { name: 'Du må svare på om barnet har en årlig inntekt over 111 477kr' })
    .first()
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/#barn.0.harInntekt');
  await page
    .getByRole('link', { name: 'Du må svare på om barnet har en årlig inntekt over 111 477kr' })
    .nth(1)
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/#barn.1.harInntekt');
  await page
    .locator(
      'article:has-text("Navn: Embla Bakke LiFødselsdato: 11.01.2022Har barnet årlig inntekt over 111 477")'
    )
    .getByLabel('Ja')
    .check();
  await page
    .locator(
      'article:has-text("Navn: Jonas Li Fødselsdato: 11.01.2021Har barnet årlig inntekt over 111 477kr?Hv")'
    )
    .getByLabel('Nei')
    .check();
  await expect(
    page.getByText(
      'InformasjonDu får ikke barnetillegg hvis:Barnet mottar barnepensjon.Barnet har e'
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Legg til Legg til barn' }).click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await page.getByText('Du må fylle inn barnets fornavn og mellomnavn.').click();
  await page.getByText('Du må fylle inn barnets etternavn.').click();
  await page.getByText('Du må fylle inn barnets fødselsdato. Fyll inn slik: dd.mm.åååå.').click();
  await page.getByText('Du må svare på hvilken relasjon du har til barnet.').click();
  await page.getByText('Du må svare på om barnet har en årlig inntekt over 111 477kr').click();
  await page.getByLabel('Fornavn og mellomnavn').click();
  await page.getByLabel('Fornavn og mellomnavn').fill('Kjell T.');
  await page.getByLabel('Etternavn').fill('Ringen');
  await page.getByRole('button', { name: 'Åpne datovelger' }).click();
  await page.getByLabel('Fødselsdato (dd.mm.åååå)').fill('10.01.2000');
  await page.getByRole('radio', { name: 'Forelder' }).check();
  await page.getByRole('radio', { name: 'Nei' }).check();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await expect(
    page.getByText(
      'Du kan ikke få barnetillegg for barn over 18 år. Hvis barnet er under 18 år, må'
    )
  ).toBeVisible();
  await page.getByLabel('Fødselsdato (dd.mm.åååå)').click();
  await page.getByLabel('Fødselsdato (dd.mm.åååå)').fill('10.01.2023');
  await page.getByRole('button', { name: 'Lagre' }).click();
  await expect(
    page.getByText(
      'InformasjonDu må legge ved:Bekreftelse på at du er forelder til barnet, og fra n'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 6
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/6/');
  await expect(page.getByRole('heading', { name: 'Student' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await page.locator('p:has-text("Du må svare på om du er student.")').click();
  await page.getByRole('link', { name: 'Du må svare på om du er student.' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/6/#student.erStudent');
  await page.getByLabel('Ja, men har avbrutt studiet helt på grunn av sykdom').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    page.locator('p:has-text("Du må svare på om du har planer om å komme tilbake til studiet.")')
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Du må svare på om du har planer om å komme tilbake til studiet.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/6/#student.kommeTilbake');
  await page.getByRole('radio', { name: 'Ja' }).check();
  await expect(
    page.getByText(
      'InformasjonDu må legge ved:Bekreftelse fra studiested på hvilken dato studiet bl'
    )
  ).toBeVisible();
  await page
    .getByRole('group', { name: 'Har du planer om å komme tilbake til studiet?' })
    .getByLabel('Nei')
    .check();
  await expect(
    page.getByText(
      'InformasjonDu må legge ved:Bekreftelse fra studiested på hvilken dato studiet bl'
    )
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 7
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/7/');
  await expect(page.getByRole('heading', { name: 'Utbetalinger' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    page.locator(
      'p:has-text("Du må krysse av for om du har fått eller skal få ekstra utbetalinger fra arbeids")'
    )
  ).toBeVisible();
  await expect(
    page.locator(
      'p:has-text("Du må krysse av for om du får eller nylig har søkt om noen av utbetalingene over")'
    )
  ).toBeVisible();
  await page
    .getByRole('link', {
      name: 'Du må krysse av for om du har fått eller skal få ekstra utbetalinger fra arbeidsgiver.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/7/#andreUtbetalinger.l%C3%B8nn');
  await page
    .getByRole('link', {
      name: 'Du må krysse av for om du får eller nylig har søkt om noen av utbetalingene over.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/7/#andreUtbetalinger.st%C3%B8nad');
  await page.getByLabel('Ja').check();
  await page.getByLabel('Avtalefestet pensjon (AFP)').check();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  //TODO Mangler feilmelding på textfield AFP
  await page
    .getByRole('link', { name: 'Du må svare på hvem som utbetaler avtalefestet pensjon (AFP).' })
    .click();
  await expect(page).toHaveURL(
    'http://localhost:3000/aap/soknad/7/#andreUtbetalinger.afp.hvemBetaler'
  );
  await page.getByLabel('Hvem utbetaler avtalefestet pensjon (AFP)?').fill('nav');
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 8
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/8/');
  await page.getByRole('heading', { name: 'Tilleggsopplysninger' }).click();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 9
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/');
  await expect(page.getByRole('heading', { name: 'Vedlegg' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lønn og andre goder' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Fødselsattest eller adopsjonsbevis' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Annen dokumentasjon' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 10
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/10/');
  await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
  await page.getByRole('button', { name: 'Send søknad' }).click();
  //TODO Feilmelding på confirmationPanel
  await page
    .getByRole('link', {
      name: 'Vennligst bekreft at du har lest all informasjon i søknaden og at opplysningene du har gitt er korrekte.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/10/#s%C3%B8knadBekreft');
  await page
    .getByLabel(
      'Jeg har lest all informasjonen jeg har fått i søknaden og bekrefter at opplysningene jeg har gitt er korrekte.'
    )
    .check();
  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/kvittering/');
  await expect(page.getByRole('heading', { name: 'Takk for søknaden, Jackie Li' })).toBeVisible();
});

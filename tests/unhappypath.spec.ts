import { expect, test } from '@playwright/test';
import { addDays, addMonths, format, subYears } from 'date-fns';
import { formatDate } from '../utils/date';

test('at alle feilmeldinger skal dukke opp', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');
  await page.getByRole('button', { name: 'Start søknad' }).click();
  await expect(
    await page.getByText('Du må bekrefte at du vil gi så riktige opplysninger som mulig.')
  ).toBeVisible();
  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();
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
    .getByText('Søknad om arbeidsavklarings­penger (AAP)Steg 1 av 9Du må fikse disse feilene fø')
    .click();

  const today = format(new Date(), 'dd.MM.yyyy');
  const tomorrow = format(addDays(new Date(), 1), 'dd.MM.yyyy');
  await page.getByRole('textbox', { name: /fra dato \(dd\.mm\.åååå\)/i }).fill(tomorrow);
  await page.getByRole('textbox', { name: /til dato \(dd\.mm\.åååå\)/i }).fill(today);

  await page.getByRole('button', { name: 'Neste steg' }).click();

  await page
    .locator('p:has-text("Fra-dato må være eldre enn til-dato. Fyll inn slik: dd.mm.åååå.")')
    .click();
  await page
    .getByRole('link', { name: 'Fra-dato må være eldre enn til-dato. Fyll inn slik: dd.mm.åååå.' })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/#ferie.tilDato');
  await page.getByRole('textbox', { name: /fra dato \(dd\.mm\.åååå\)/i }).fill(today);
  await page.getByRole('textbox', { name: /til dato \(dd\.mm\.åååå\)/i }).fill(tomorrow);
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
  await expect(await page.getByRole('heading', { name: 'Bosted og jobb' })).toBeVisible();
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
  await expect(
    await page
      .getByText('Du har svart at du har jobbet utenfor Norge de fem siste årene. Du må derfor leg')
      .nth(1)
  ).toBeVisible();

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
  await expect(page.getByText('Vennligst oppgi land')).toBeVisible();
  await expect(page.getByText('Vennligst oppgi fra dato')).toBeVisible();
  await expect(page.getByText('Vennligst oppgi til dato')).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Hvilket land jobbet du i?' })
    .selectOption('AL:Albania');

  const thisMonth = new Date();
  const nextMonth = addMonths(new Date(), 1);

  await page
    .getByRole('textbox', { name: /fra og med måned \(mm\.åååå\)/i })
    .fill(formatDate(nextMonth) ?? '');
  await page
    .getByRole('textbox', { name: /til og med måned \(mm\.åååå\)/i })
    .fill(formatDate(thisMonth) ?? '');

  await page.getByRole('button', { name: 'Lagre' }).click();
  await expect(
    await page.getByText('Fra-dato må være eldre enn til-dato. Fyll inn slik: mm.åååå.')
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: /fra og med måned \(mm\.åååå\)/i })
    .fill(formatDate(thisMonth) ?? '');
  await page
    .getByRole('textbox', { name: /til og med måned \(mm\.åååå\)/i })
    .fill(formatDate(nextMonth) ?? '');

  await page.getByRole('button', { name: 'Lagre' }).click();

  await page
    .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    await page.locator(
      'p:has-text("Du må svare på om du har jobbet sammenhengende i Norge de fem siste årene.")'
    )
  ).toBeVisible();

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
  await expect(
    await page.locator(
      'p:has-text("Du må svare på om du i tillegg til jobb i Norge, også har jobbet i et annet land")'
    )
  ).toBeVisible();

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
  await expect(
    await page
      .getByText('Du har svart at du også har jobbet utenfor Norge de fem siste årene. Du må derfo')
      .nth(1)
  ).toBeVisible();

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
  await expect(await page.getByRole('heading', { name: 'Yrkesskade' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    await page.locator('p:has-text("Du må svare på om du har en yrkesskade eller yrkessykdom.")')
  ).toBeVisible();
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
  await expect(
    await page.getByRole('heading', { name: 'Kontaktperson for helseopplysninger' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    await page.locator(
      'p:has-text("Du må svare på om informasjonen om din registrerte behandler er riktig.")'
    )
  ).toBeVisible();
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
  await expect(await page.getByText('Navn:Iren Panikk')).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 5
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/');
  await expect(await page.getByRole('heading', { name: 'Barnetillegg' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(
    page.getByText('Du må svare på om barnet har en årlig inntekt over 118 620kr')
  ).toHaveCount(4);
  await page
    .getByRole('link', { name: 'Du må svare på om barnet har en årlig inntekt over 118 620kr' })
    .first()
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/#barn.0.harInntekt');
  await page
    .getByRole('link', { name: 'Du må svare på om barnet har en årlig inntekt over 118 620kr' })
    .nth(1)
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/5/#barn.1.harInntekt');
  await page
    .getByRole('group', { name: 'Har barnet årlig inntekt over 118 620kr?' })
    .first()
    .getByLabel('Ja')
    .check();
  await page
    .getByRole('group', { name: 'Har barnet årlig inntekt over 118 620kr?' })
    .nth(1)
    .getByLabel('Nei')
    .check();
  await expect(
    page.getByText(
      'InformasjonDu får ikke barnetillegg hvis:Barnet mottar barnepensjon.Barnet har e'
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Legg til Legg til barn' }).click();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await expect(
    await page.getByText('Du må fylle inn barnets fornavn og mellomnavn.')
  ).toBeVisible();
  await expect(await page.getByText('Du må fylle inn barnets etternavn.')).toBeVisible();
  await expect(
    await page.getByText('Du må fylle inn barnets fødselsdato. Fyll inn slik: dd.mm.åååå.')
  ).toBeVisible();
  await expect(
    await page.getByText('Du må svare på hvilken relasjon du har til barnet.')
  ).toBeVisible();
  await expect(
    await page.getByText('Du må svare på om barnet har en årlig inntekt over 118 620kr')
  ).toBeVisible();
  await page.getByLabel('Fornavn og mellomnavn').fill('Kjell T.');
  await page.getByLabel('Etternavn').fill('Ringen');

  const over18years = subYears(new Date(), 19);

  await page.getByLabel('Fødselsdato (dd.mm.åååå)').fill(format(over18years, 'dd.MM.yyyy'));
  await page.getByRole('radio', { name: 'Forelder', exact: true }).check();
  await page.getByRole('radio', { name: 'Nei' }).check();
  await page.getByRole('button', { name: 'Lagre' }).click();
  await expect(
    page.getByText(
      'Du kan ikke få barnetillegg for barn over 18 år. Hvis barnet er under 18 år, må'
    )
  ).toBeVisible();

  await page.getByLabel('Fødselsdato (dd.mm.åååå)').fill(format(new Date(), 'dd.MM.yyyy'));
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
  await expect(await page.locator('p:has-text("Du må svare på om du er student.")')).toBeVisible();
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
  await page.getByRole('radio', { name: 'Ja', exact: true }).check();
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

  await expect(
    await page.getByText('Du må svare på hvem som utbetaler avtalefestet pensjon (AFP).')
  ).toHaveCount(2);
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
  await expect(
    page.getByRole('heading', { name: 'Vedlegg og tilleggsopplysninger' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lønn og andre goder' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Fødselsattest eller adopsjonsbevis' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Annen dokumentasjon' })).toBeVisible();
  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 9
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/');
  await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(
    page.getByText(
      'Vennligst bekreft at du har lest all informasjon i søknaden og at opplysningene du har gitt er korrekte.'
    )
  ).toHaveCount(2);

  await page
    .getByRole('link', {
      name: 'Vennligst bekreft at du har lest all informasjon i søknaden og at opplysningene du har gitt er korrekte.',
    })
    .click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/9/#s%C3%B8knadBekreft');
  await page
    .getByLabel(
      'Jeg har lest all informasjonen jeg har fått i søknaden og bekrefter at opplysningene jeg har gitt er korrekte.'
    )
    .check();
  await page.getByRole('button', { name: 'Send søknad' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/kvittering/');
  await expect(page.getByRole('heading', { name: 'Takk for søknaden, Jackie Li' })).toBeVisible();
});

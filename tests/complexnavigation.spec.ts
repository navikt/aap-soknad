import { expect, test } from '@playwright/test';
import { addDays, addMonths, format } from 'date-fns';
import { formatDate } from '../utils/date';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/aap/soknad/');
  await page.getByLabel('Jeg vil svare så godt jeg kan på spørsmålene i søknaden.').check();
  await page.getByRole('button', { name: 'Start søknad' }).click();

  // Steg 1
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/');
  await page.getByLabel('Ja').check();
  await page
    .getByRole('group', { name: 'Har du planer om å ta ferie før du er ferdig med sykepenger?' })
    .getByLabel('Ja')
    .check();
  await page.getByLabel('Ja, jeg vet fra-dato og til-dato').check();
  const today = format(new Date(), 'dd.MM.yyyy');
  const tomorrow = format(addDays(new Date(), 1), 'dd.MM.yyyy');
  await page.getByRole('textbox', { name: /fra dato \(dd\.mm\.åååå\)/i }).fill(today);
  await page.getByRole('textbox', { name: /til dato \(dd\.mm\.åååå\)/i }).fill(tomorrow);
  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/');

  await expect(
    await page.getByRole('group', { name: 'Har du sykepenger nå?' }).getByLabel('Ja').isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Har du planer om å ta ferie før du er ferdig med sykepenger?' })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Vet du når du skal ta ferie?' })
      .getByLabel('Ja, jeg vet fra-dato og til-dato')
      .isChecked()
  ).toBe(true);

  await expect(
    await page.getByRole('textbox', { name: /fra dato \(dd\.mm\.åååå\)/i }).inputValue()
  ).toEqual(today);
  await expect(
    await page.getByRole('textbox', { name: /til dato \(dd\.mm\.åååå\)/i }).inputValue()
  ).toEqual(tomorrow);

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/');

  await page.getByLabel('Nei, men jeg vet antall arbeidsdager jeg skal ta ferie').check();
  await page.getByLabel('Skriv inn antall arbeidsdager du skal ta ferie').fill('3');

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/1/');

  await expect(
    await page.getByRole('group', { name: 'Har du sykepenger nå?' }).getByLabel('Ja').isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Har du planer om å ta ferie før du er ferdig med sykepenger?' })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Vet du når du skal ta ferie?' })
      .getByLabel('Nei, men jeg vet antall arbeidsdager jeg skal ta ferie')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('textbox', { name: 'Skriv inn antall arbeidsdager du skal ta ferie' })
      .inputValue()
  ).toEqual('3');

  await page.getByRole('button', { name: 'Neste steg' }).click();

  // Steg 2
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');
  await page.getByLabel('Ja').check();
  await page
    .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
    .getByLabel('Ja')
    .check();
  await page
    .getByRole('button', { name: 'Legg til Registrer periode med jobb utenfor Norge' })
    .click();
  await page
    .getByRole('combobox', { name: 'Hvilket land jobbet du i?' })
    .selectOption('AL:Albania');

  const thisMonth = new Date();
  const nextMonth = addMonths(new Date(), 1);

  await page
    .getByRole('textbox', { name: /fra og med måned \(mm\.åååå\)/i })
    .fill(formatDate(thisMonth) ?? '');
  await page
    .getByRole('textbox', { name: /til og med måned \(mm\.åååå\)/i })
    .fill(formatDate(nextMonth) ?? '');
  await page.getByRole('button', { name: 'Lagre' }).click();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');

  await expect(
    await page
      .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Har du jobbet utenfor Norge de fem siste årene?' })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page.getByRole('button', {
      name: `Albania ${formatDate(thisMonth, 'MMMM yyyy')} - ${formatDate(nextMonth, 'MMMM yyyy')}`,
    })
  ).toBeVisible();

  await page
    .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();
  await page
    .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Ja')
    .check();
  await page
    .getByRole('group', {
      name: 'Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?',
    })
    .getByLabel('Ja')
    .check();
  await page
    .getByRole('button', { name: 'Legg til Registrer periode med jobb utenfor Norge' })
    .click();

  await page
    .getByRole('combobox', { name: 'Hvilket land jobbet du i?' })
    .selectOption('BG:Bulgaria');

  await page
    .getByRole('textbox', { name: /fra og med måned \(mm\.åååå\)/i })
    .fill(formatDate(thisMonth) ?? '');
  await page
    .getByRole('textbox', { name: /til og med måned \(mm\.åååå\)/i })
    .fill(formatDate(nextMonth) ?? '');

  await expect(
    await page.getByLabel('ID-nummer/personnummer for det landet du har jobbet i (valgfritt)')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Lagre' }).click();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');

  await expect(
    await page
      .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
      .getByLabel('Nei')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', {
        name: 'Har du i tillegg til jobb i Norge, også jobbet i et annet land de fem siste årene?',
      })
      .getByLabel('Ja')
      .isChecked()
  ).toBe(true);

  await expect(
    await page.getByRole('button', {
      name: `Bulgaria ${formatDate(thisMonth, 'MMMM yyyy')} - ${formatDate(
        nextMonth,
        'MMMM yyyy'
      )}`,
    })
  ).toBeVisible();

  await page
    .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
    .getByLabel('Nei')
    .check();

  await page.getByRole('button', { name: 'Legg til Registrer utenlandsopphold' }).click();

  await page.getByRole('combobox', { name: 'Hvilket land var du i?' }).selectOption('BR:Brasil');

  await page
    .getByRole('textbox', { name: /fra og med måned \(mm\.åååå\)/i })
    .fill(formatDate(thisMonth) ?? '');
  await page
    .getByRole('textbox', { name: /til og med måned \(mm\.åååå\)/i })
    .fill(formatDate(nextMonth) ?? '');

  await page
    .getByRole('group', { name: 'Jobbet du i dette landet i denne perioden?' })
    .getByLabel('Ja')
    .check();

  await page.getByRole('button', { name: 'Lagre' }).click();

  await page.getByRole('button', { name: 'Neste steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/3/');
  await page.getByRole('button', { name: 'Forrige steg' }).click();
  await expect(page).toHaveURL('http://localhost:3000/aap/soknad/2/');

  await expect(
    await page
      .getByRole('group', { name: 'Har du bodd sammenhengende i Norge de fem siste årene?' })
      .getByLabel('Nei')
      .isChecked()
  ).toBe(true);

  await expect(
    await page
      .getByRole('group', { name: 'Har du jobbet sammenhengende i Norge de fem siste årene?' })
      .getByLabel('Nei')
      .isChecked()
  ).toBe(true);

  await expect(
    await page.getByRole('button', {
      name: `Brasil ${formatDate(thisMonth, 'MMMM yyyy')} - ${formatDate(
        nextMonth,
        'MMMM yyyy'
      )} (Jobb)`,
    })
  ).toBeVisible();
});
